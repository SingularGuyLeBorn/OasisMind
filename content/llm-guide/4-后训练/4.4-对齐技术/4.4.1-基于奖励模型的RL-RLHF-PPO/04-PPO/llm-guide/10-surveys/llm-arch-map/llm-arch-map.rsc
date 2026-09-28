# Copyright (c) Alibaba, Inc. and its affiliates.
import os

import faiss
import json
import numpy as np
import torch
import tqdm
from torch.optim import AdamW
from torch.utils.data import DataLoader
from transformers import get_scheduler

from modelscope.metainfo import Trainers
from modelscope.models import Model
from modelscope.preprocessors import \
    DocumentGroundedDialogRetrievalPreprocessor
from modelscope.trainers import EpochBasedTrainer
from modelscope.trainers.builder import TRAINERS
from modelscope.utils.constant import ModeKeys
from modelscope.utils.logger import get_logger

logger = get_logger()


def collate(batch):
    query = [item['query'] for item in batch]
    positive = [item['positive'] for item in batch]
    negative = [item['negative'] for item in batch]
    return query, positive, negative


def prepare_optimizer(model, lr, weight_decay, eps):
    no_decay = ['bias', 'LayerNorm.weight']
    optimizer_grouped_parameters = [{
        'params': [
            p for n, p in model.named_parameters()
            if not any(nd in n for nd in no_decay)
        ],
        'weight_decay':
        weight_decay,
    }, {
        'params': [
            p for n, p in model.named_parameters()
            if any(nd in n for nd in no_decay)
        ],
        'weight_decay':
        0.0,
    }]
    optimizer = AdamW(optimizer_grouped_parameters, lr=lr, eps=eps)
    return optimizer


def prepare_scheduler(optimizer, epochs, steps_per_epoch, warmup_rate):
    total_steps = epochs * steps_per_epoch
    warmup_steps = int(total_steps * warmup_rate)
    scheduler = get_scheduler(
        name='linear',
        optimizer=optimizer,
        num_warmup_steps=warmup_steps,
        num_training_steps=total_steps)
    return scheduler


def measure_result(result_dict):
    recall_k = [1, 5, 10, 20]
    meters = {f'R@{k}': [] for k in recall_k}

    for output, target in zip(result_dict['outputs'], result_dict['targets']):
        for k in recall_k:
            if target in output[:k]:
                meters[f'R@{k}'].append(1)
            else:
                meters[f'R@{k}'].append(0)
    for k, v in meters.items():
        meters[k] = sum(v) / len(v)
    return meters


@TRAINERS.register_module(
    module_name=Trainers.document_grounded_dialog_retrieval_trainer)
class DocumentGroundedDialogRetrievalTrainer(EpochBasedTrainer):

    def __init__(self, model: str, revision='v1.0.0', *args, **kwargs):
        self.model = Model.from_pretrained(model, revision=revision)
        self.preprocessor = DocumentGroundedDialogRetrievalPreprocessor(
            model_dir=self.model.model_dir)
        self.device = self.preprocessor.device
        self.model.model.to(self.device)
        self.train_dataset = kwargs['train_dataset']
        self.eval_dataset = kwargs['eval_dataset']
        self.all_passages = kwargs['all_passages']

    def train(self,
              total_epoches=20,
              batch_size=128,
              per_gpu_batch_size=32,
              accumulation_steps=1,
              learning_rate=2e-5,
              warmup_ratio=0.1,
              weight_decay=0.1,
              eps=1e-06,
              loss_log_freq=40):
        """
        Fine-tuning trainsets
        """
        # obtain train loader
        train_loader = DataLoader(
            dataset=self.train_dataset,
            batch_size=batch_size,
            shuffle=True,
            collate_fn=collate)

        optimizer = prepare_optimizer(self.model.model, learning_rate,
                                      weight_decay, eps)
        steps_per_epoch = len(train_loader) // accumulation_steps
        scheduler = prepare_scheduler(optimizer, total_epoches,
                                      steps_per_epoch, warmup_ratio)

        best_score = 0.0
        for epoch in range(total_epoches):
            self.model.model.train()
            losses = []
            for index, payload in enumerate(tqdm.tqdm(train_loader)):
                query, positive, negative = payload
                processed = self.preprocessor(
                    {
                        'query': query,
                        'positive': positive,
                        'negative': negative
                    },
                    invoke_mode=ModeKeys.TRAIN)
                loss, logits = self.model.forward(processed)

                if accumulation_steps > 1:
                    loss = loss / accumulation_steps

                loss.backward()

                if (index + 1) % accumulation_steps == 0:
                    optimizer.step()
                    scheduler.step()
                    optimizer.zero_grad()
                losses.append(loss.item())
                if (index + 1) % loss_log_freq == 0:
                    logger.info(
                        f'epoch: {epoch} \t batch: {batch_size * index} \t loss: {sum(losses) / len(losses)}'
                    )
                    losses = []
            if losses:
                logger.info(
                    f'epoch: {epoch} \t batch: last \t loss: {sum(losses) / len(losses)}'
                )

            meters = self.evaluate(per_gpu_batch_size=per_gpu_batch_size)
            