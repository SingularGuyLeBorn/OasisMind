# Copyright (c) Alibaba, Inc. and its affiliates.

import math
import os
from typing import Callable, Dict, Optional, Tuple, Union

import torch
from torch import distributed as dist
from torch import nn
from torch.utils.data import Dataset

from modelscope.metainfo import Trainers
from modelscope.models.base import Model, TorchModel
from modelscope.models.multi_modal.clip.model import convert_models_to_fp32
from modelscope.msdatasets.ms_dataset import MsDataset
from modelscope.preprocessors.base import Preprocessor
from modelscope.preprocessors.multi_modal import CLIPPreprocessor
from modelscope.trainers import EpochBasedTrainer
from modelscope.trainers.builder import TRAINERS
from modelscope.trainers.default_config import merge_cfg, update_cfg
from modelscope.trainers.optimizer.builder import build_optimizer
from modelscope.utils.config import Config
from modelscope.utils.constant import (DEFAULT_MODEL_REVISION, ConfigKeys,
                                       Invoke, ModeKeys, ModelFile, ThirdParty)
from .clip_trainer_utils import get_loss, get_optimizer_params, get_schedule


def exclude(n):
    return 'bn' in n or 'ln' in n or 'bias' in n or 'logit_scale' in n


def include(n):
    return not exclude(n)


@TRAINERS.register_module(module_name=Trainers.clip_multi_modal_embedding)
class CLIPTrainer(EpochBasedTrainer):

    def __init__(
            self,
            model: Optional[Union[TorchModel, nn.Module, str]] = None,
            cfg_file: Optional[str] = None,
            cfg_modify_fn: Optional[Callable] = None,
            arg_parse_fn: Optional[Callable] = None,
            data_collator: Optional[Union[Callable, Dict[str,
                                                         Callable]]] = None,
            train_dataset: Optional[Union[MsDataset, Dataset]] = None,
            eval_dataset: Optional[Union[MsDataset, Dataset]] = None,
            preprocessor: Optional[Union[Preprocessor,
                                         Dict[str, Preprocessor]]] = None,
            optimizers: Tuple[torch.optim.Optimizer,
                              torch.optim.lr_scheduler._LRScheduler] = (None,
                                                                        None),
            model_revision: Optional[str] = DEFAULT_MODEL_REVISION,
            seed: int = 42,
            **kwargs):
        if isinstance(model, str):
            third_party = kwargs.get(ThirdParty.KEY, None)
            if third_party is not None:
                kwargs.pop(ThirdParty.KEY)

            self.model_dir = self.get_or_download_model_dir(
                model, model_revision, third_party)
            if cfg_file is None:
                cfg_file = os.path.join(self.model_dir,
                                        ModelFile.CONFIGURATION)
        else:
            assert cfg_file is not None, 'Config file should not be None if model is not from pretrained!'
            self.model_dir = os.path.dirname(cfg_file)
        self.cfg = Config.from_file(cfg_file)

        self.cfg_modify_fn = cfg_modify_fn
        # add default config
        merge_cfg(self.cfg)
        self.cfg = self.rebuild_config(self.cfg)
        if 'cfg_options' in kwargs:
            self.cfg.merge_from_dict(kwargs['cfg_options'])
        self.cfg = update_cfg(self.cfg)
        cfg = self.cfg

        model = Model.from_pretrained(
            model, revision=model_revision, invoked_by=Invoke.TRAINER)
        # for training & eval, we convert the model from FP16 back to FP32
        # to compatible with modelscope amp training
        convert_models_to_fp32(model)

        if 'work_dir' not in kwargs or len(kwargs['work_dir']) == 0:
            work_dir = cfg.train.work_dir
        else:
            work_dir = kwargs['work_dir']

        # fetch the model name of CLIP model (base, large or large-336)
        model_name = cfg.pretrained_model.model_name

        # world size
        world_size = int(os.environ.get('WORLD_SIZE', 1))

        # train step, optimizer and lr_scheduler
        epoch_steps = math.ceil(
            len(train_dataset) /  # noqa
            (cfg.train.dataloader.batch_size_per_gpu * world_size))  # noqa
        cfg.train.lr_scheduler.num_train_steps = epoch_steps * cfg.train.max_epochs

        if optimizers[0] is None:
            named_parameters = list(model.named_parameters())
            gain_or_bias_params = [
                p for n, p in named_parameters
                if exclude(n) and p.requires_grad
            ]
            rest_params = [
                p for n, p in named_parameters
                if include(n) and p.requires_grad
            ]
            optimizer_hparams = get_optimizer_params(
                model_name, cfg)  # lr, wd, beta1, beta2, eps
            optimizer_args = {
                'params': [
                    {
                        'params': gain_or_bias_params,
                        'weight_decay': 0.
                    },
                    {
                        'params': rest_params,
                        'weight_decay': optimizer_hparams['weight_decay']
                    },
                ],
                'lr':
                optimizer_hparams['lr'],
                'betas':
                (optimizer_hparams['beta1'], optimizer_hparams['beta2