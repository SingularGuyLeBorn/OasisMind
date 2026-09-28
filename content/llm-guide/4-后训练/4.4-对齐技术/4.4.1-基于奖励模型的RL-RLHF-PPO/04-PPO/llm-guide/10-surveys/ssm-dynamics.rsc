# Copyright (c) Alibaba, Inc. and its affiliates.

import math
import os
import shutil
import tempfile
from functools import partial
from shutil import ignore_patterns
from typing import Callable, Dict, Optional, Tuple, Union

import json
import torch
from torch import distributed as dist
from torch import nn
from torch.utils.data import Dataset

from modelscope.hub.file_download import model_file_download
from modelscope.metainfo import Trainers
from modelscope.models.base import Model, TorchModel
from modelscope.msdatasets.ms_dataset import MsDataset
from modelscope.preprocessors.base import Preprocessor
from modelscope.preprocessors.multi_modal import OfaPreprocessor
from modelscope.preprocessors.ofa.utils.collate import collate_fn
from modelscope.trainers import EpochBasedTrainer
from modelscope.trainers.builder import TRAINERS
from modelscope.trainers.optimizer.builder import build_optimizer
from modelscope.trainers.parallel.utils import is_parallel
from modelscope.utils.config import Config
from modelscope.utils.constant import (DEFAULT_MODEL_REVISION, ConfigKeys,
                                       Invoke, ModeKeys, ModelFile)
from .ofa_trainer_utils import (AdjustLabelSmoothedCrossEntropyCriterion,
                                get_schedule, recursive_overwrite)


@TRAINERS.register_module(module_name=Trainers.ofa)
class OFATrainer(EpochBasedTrainer):
    r"""
    OFA trainer for MaaS.

    Args:
        model (`str`): A model dir or a model id to be loaded
        cfg_file (`str`, **optional**, default to `None`):
            A config dir
        cfg_modify_fn (`Callable`, **optional**, default to `None`):
            A function which can rebuild the config file.
        arg_parse_fn (`Callable`, **optional**, default to `None`):
            Same as ``parse_fn`` in :obj:`Config.to_args`.
        data_collator (`Callable`, **optional**, default to `None`):
            The function to use to form a batch from a list of elements
            of `train_dataset` or `eval_dataset`.
        train_dataset (:obj:`MsDataset` or :obj:`Dataset`, **optional**, default to `None`):
            Dataset for training.
        eval_dataset (:obj:`MsDataset` or :obj:`Dataset`, **optional**, default to `None`):
            Dataset for evaluation.
        preprocessor (:obj:`Preprocessor`, **optional**, default to `None`):
            The optional preprocessor.
            NOTE: If the preprocessor has been called before the dataset fed into this trainer by user's custom code,
            this parameter should be None, meanwhile remove the 'preprocessor' key from the cfg_file.
            Else the preprocessor will be instantiated from the cfg_file or assigned from this parameter and
            this preprocessing action will be executed every time the dataset's __getitem__ is called.
        model_revision (`str`, **optional**, default to `None`):
            The revision used when the model_name_or_path is
                a model id of the remote hub. default `None`.
        seed (`int`, **optional**, default to `42`):
            The optional random seed for torch, cuda, numpy and random.
    """

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
        model = Model.from_pretrained(
            model, revision=model_revision, invoked_by=Invoke.TRAINER)
        model_dir = model.model_dir
        self.cfg_modify_fn = cfg_modify_fn

        work_dir = kwargs.get('work_dir', 'workspace')
        os.makedirs(work_dir, exist_ok=True)
        ignore_file_set = set()
        if cfg_file is not None:
            cfg_file = self.get_config_file(cfg_file)
            dst = os.path.abspath(
                os.path.join(work_dir, ModelFile.CONFIGURATION))
            src = os.path.abspath(cfg_file)
            if s