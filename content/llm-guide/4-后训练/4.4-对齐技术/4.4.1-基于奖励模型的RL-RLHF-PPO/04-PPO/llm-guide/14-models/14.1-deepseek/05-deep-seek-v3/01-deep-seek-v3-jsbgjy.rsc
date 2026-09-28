# Copyright (c) 2021 Binbin Zhang(binbzha@qq.com)
#               2022 Shaoqing Yu(954793264@qq.com)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import glob
import os
import threading

import json
import kaldiio
import matplotlib.font_manager as fm
import matplotlib.pyplot as plt
import numpy as np
import torch

from modelscope.utils.logger import get_logger
from .file_utils import make_pair, read_lists, space_mixed_label

logger = get_logger()

font = fm.FontProperties(size=15)


class thread_wrapper(threading.Thread):

    def __init__(self, func, args=()):
        super(thread_wrapper, self).__init__()
        self.func = func
        self.args = args
        self.result = []

    def run(self):
        self.result = self.func(*self.args)

    def get_result(self):
        try:
            return self.result
        except Exception:
            return None


def count_duration(tid, data_lists):
    results = []

    for obj in data_lists:
        assert 'key' in obj
        assert 'wav' in obj
        assert 'txt' in obj
        # key = obj['key']
        wav_file = obj['wav']
        # txt = obj['txt']

        try:
            rate, waveform = kaldiio.load_mat(wav_file)
            waveform = torch.tensor(waveform, dtype=torch.float32)
            waveform = waveform.unsqueeze(0)
            frames = len(waveform[0])
            duration = frames / float(rate)
        except Exception:
            logger.info(f'load file failed: {wav_file}')
            duration = 0.0

        obj['duration'] = duration
        results.append(obj)

    return results


def load_data_and_score(keywords_list, data_file, trans_file, score_file):
    # score_table: {uttid: [keywordlist]}
    score_table = {}
    with open(score_file, 'r', encoding='utf8') as fin:
        # read score file and store in table
        for line in fin:
            arr = line.strip().split()
            key = arr[0]
            is_detected = arr[1]
            if is_detected == 'detected':
                if key not in score_table:
                    score_table.update({
                        key: {
                            'kw': space_mixed_label(arr[2]),
                            'confi': float(arr[3])
                        }
                    })
            else:
                if key not in score_table:
                    score_table.update({key: {'kw': 'unknown', 'confi': -1.0}})

    wav_lists = read_lists(data_file)
    trans_lists = read_lists(trans_file)
    data_lists = make_pair(wav_lists, trans_lists)
    logger.info(f'origin list samples: {len(data_lists)}')

    # count duration for each wave use multi-thread
    num_workers = 8
    start = 0
    step = int(len(data_lists) / num_workers)
    tasks = []
    for idx in range(num_workers):
        if idx != num_workers - 1:
            task = thread_wrapper(count_duration,
                                  (idx, data_lists[start:start + step]))
        else:
            task = thread_wrapper(count_duration, (idx, data_lists[start:]))
        task.start()
        tasks.append(task)
        start += step

    duration_lists = []
    for task in tasks:
        task.join()
        duration_lists += task.get_result()
    logger.info(f'after list samples: {len(duration_lists)}')

    # build empty structure for keyword-filler infos
    keyword_filler_table = {}
    for keyword in keywords_list:
        keyword = space_mixed_label(keyword)
        keyword_filler_table[keyword] = {}
        keyword_filler_table[keyword]['keyword_table'] = {}
        keyword_filler_table[keyword]['keyword_duration'] = 0.0
        keyword_filler_table[keyword]['filler_table'] = {}
        keyword_filler_table[keyword]['filler_duration'] = 0.0

    for obj in duration_lists:
        assert 'key' in obj
        assert 'wav' in obj
        assert 'txt' in obj
        assert 'duration' in obj

        key = obj['key']
        # wav_file = obj['wav']
        txt = obj['txt']
        txt = space_mixed_label(txt)
        txt_regstr_lrblk = ' ' + txt + ' '
        duration = obj['duration']
        assert key in score_table

        for keyword in keywords_list:
            keyword = space_mixed_label(keyword)
            keyword_regstr_lrblk = ' ' + keyword + ' '
            if txt_regstr_lrblk.find(keyword_regstr_lrblk) != -1:
                if keyword == score_table[key]['kw']:
                    keyword_filler_table[keyword]['keyword_table'].update(
                        {key: score_table[key]['confi']})
                else:
                    # uttrance detected but not match this keyword
                    keyword_filler_table[keyword]['keyword_table'].update(
                        {key: -1.0})
                keyword_filler_table[keyword]['keyword_duration'] += duration
            else:
                if keyword == score_table[key]['kw']:
                    keyword_filler_table[keyword]['filler_table'].update(
                        {key: score_table[key]['confi']})
                else:
                    # uttrance if detected, which is not FA for this keyword
                    keyword_filler_table[keyword]['filler_table'].update(
                        {key: -1.0})
                keyword_filler_table[keyword]['filler_duration'] 