源文是 GitHub 上 meta-llama/llama-models 仓库首页的抓取, 5 页, 1 张图, 不是 Llama 的技术报告.

## 1. 这 5 页是什么

第 1 页是仓库根目录的文件清单, 17 个名字, 从 .github, docs, models 到 pyproject.toml, requirements.txt, uv.lock. 然后是一张羊驼插图. 第 2 页起是 README: 一排外链, 一段介绍, 一张模型表, 下载步骤. 第 3 到 4 页是命令行, 推理脚本, 量化, Hugging Face 下载. 第 4 到 5 页是安装, 负责任使用, 问题反馈, FAQ, 最后剩下 GitHub 侧栏的五个空标签.

没有论文标题, 没有作者, 没有摘要, 没有实验. 介绍段落是产品口吻: 开放获取, 生态广, 信任与安全三条, 加一句使命. 所以这份材料能回答 「Meta 的 Llama 仓库列了哪些模型, 怎么下载, 怎么跑」, 回答不了 「这些模型内部怎么搭」.

## 2. 表里的七行

模型表一共七行: Llama 2, Llama 3, Llama 3.1, Llama 3.2, Llama 3.2- Vision, Llama 3.3, Llama 4. 规模一列按原样是: Llama 2 有 7B, 13B, 70B. Llama 3 有 8B, 70B. Llama 3.1 有 8B, 70B, 405B. Llama 3.2 有 1B, 3B. Llama 3.2- Vision 有 11B, 90B. Llama 3.3 只有 70B. Llama 4 写的是两个名字 Scout-17B-16E 和 Maverick-17B-128E.

上下文长度从 Llama 2 的 4K, 到 Llama 3 的 8K, 再到 Llama 3.1, 3.2, 3.2- Vision, 3.3 的 128K, Llama 4 那一格印成 「10M, 1M」. 分词器一列只有两种写法: Llama 2 是 Sentencepiece, 从 Llama 3 开始都写 TikToken-based. 表里没有词表大小, 也没有说 TikToken-based 具体指什么改动.

## 3. 日期怎么读

表头没有说日期格式. 7/18/2023, 4/18/2024, 7/23/2024, 9/25/2024 的第二段都大于 12, 只能是日, 所以整列按月/日/年读. 这样 Llama 2 是 2023 年 7 月 18 日, Llama 3 是 2024 年 4 月 18 日, Llama 3.1 是 2024 年 7 月 23 日, Llama 3.2 和 3.2- Vision 同为 2024 年 9 月 25 日.

12/04/2024 按同样读法是 2024 年 12 月 4 日, 这是 Llama 3.3. 它是整列唯一给日补了前导 0 的. 4/5/2025 是 Llama 4, 按月/日读是 2025 年 4 月 5 日, 这一行两个数都小于 12, 只能靠整列的规律推断, 单看这一格分不出月和日.

## 4. Llama 4 那一行

规模格里的 Scout-17B-16E 和 Maverick-17B-128E 都带 17B, 后缀分别是 16E 和 128E. 表头写的是 Model sizes, 但页面没有解释 17B 算的是什么, 也没有解释 E. 我不在这里补任何结构说法.

上下文格是 「10M, 1M」, 没有逐个配对. 规模格的顺序是 Scout 在前, 上下文格是 10M 在前, 按排列读是 Scout 10M, Maverick 1M. 这是按顺序推的, 原文没有写出这句. 页面后面所有示例 (bf16 脚本, 量化脚本, Hugging Face 仓库, transformers 代码) 用的都是 Scout, 一次也没有拿 Maverick 举例.

## 5. 下载和命令行

从 Meta 下载分七步: 打开 llama.meta.com 的下载页, 接受许可证, 等邮件里的签名 URL, pip install llama-models, 用 llama-model list 查 model ID (要旧版本加 --show-all), 用 llama-model download --source meta --model-id 下载, 提示时粘贴 URL. 链接 24 小时后失效, 下载到一定次数也会失效, 次数没写. 出错的例子是 403: Forbidden, 办法是重新申请.

命令行一共七条: list, list --show-all, describe, download, verify-download, remove, prompt-format. 其中 download 的注释写 「from Meta or Hugging Face」, 说明同一个命令两边都能拉. 每条命令的详细用法走 llama-model COMMAND --help, 页面没有展开参数表.

## 6. 跑起来要几张卡

原生脚本这一路: 先 pip install .[torch], 示例脚本在 models/{ llama3, llama4 }/scripts/. Llama4 系列用 bf16 全精度推理至少要 4 张 GPU, 示例脚本也是 NGPUS=4, 用 torchrun 启动 models.llama4.scripts.chat_completion. 这句没写每张卡的显存. Base 模型要改检查点目录并换成 models.llama4.scripts.completion.

量化有两种模式: fp8_mixed 是部分权重 FP8, 激活 bfloat16. int4_mixed 是部分权重 Int4, 激活 bfloat16. 用 --quantization-mode 指定. 跑 Llama-4-Scout-17B-16E-Instruct 时, FP8 要 2 张 80GB 的卡, Int4 要 1 张 80GB 的卡. 精度损失只写了 「minimal」, 没有分数, 没有和 bf16 的对比表. 所以 「4 张, 2 张, 1 张」 是这 5 页唯一能对上的硬件数字, 而且 80GB 只挂在量化的两种情况上.

## 7. Hugging Face 这条路

Hugging Face 上有 transformers 和原生 llama4 两种格式. 示例仓库是 meta-llama/Llama-4-Scout-17B-16E, 可批准后那句写的是能访问 「all Llama 3.1 models as well as previous versions」, 版本号和示例对不上. 处理时间写 「used to take up to one hour」, 是过去时, 现在多久没写.

原生权重在 「Files and versions」 标签页的 original 文件夹, 也可以用 huggingface-cli download 拉 meta-llama/Llama-4-Scout-17B-16E-Instruct-Original. transformers 那段 inference.py 用 Llama4ForConditionalGeneration, device_map=「auto」, torch.bfloat16, 最多新生成 100 个 token, 启动命令是 torchrun --nnodes=1 --nproc_per_node=8. 这里是 8 个进程, 和前面原生脚本的 4 张卡不是一回事, 页面没说明两者关系.

## 8. 原文里的错字和残缺

介绍段 「built o Llama」 少了 n. 第一条外链地址印成 huggingface.co/meta-Llama, 后面 Access to Hugging Face 一节写的是 huggingface.co/meta-llama, 大小写不同. 模型名 「Llama 3.2- Vision」 连字符后多了一个空格. 表格后三列 Use Policy, License, Model Card 在 md 里只剩文字, 没有地址.

脚本和命令也有几处. bf16 那段把变量写成 `\$NGPUS`, 量化那段是 `$NGPUS`, 前者在 bash 里不会展开, 像是转写多出的反斜杠. huggingface-cli 那条 --local-dir 的路径结尾印成 Instruc, 缺了 t 和 -Original. inference.py 里 apply_chat_template 调用后多出一个单独的 `)`, 照原样跑会报语法错误. 页尾 Releases, Packages, Used by, Contributors, Languages 五个标签下面没有任何内容.

## 9. 那张图和这份材料的边界

唯一一张图是照片风格的插图: 木板墙前三只羊驼, 左白, 中紫, 右白戴蓝色尖顶帽, 桌上一杯橙黄色饮料. 它不是图标, 也不是结构图或评测图. 文件名取自下一页第一条链接 「Models on Hugging Face」 和地址, 跟画面无关. 文件清单里有 Llama_Repo.jpeg, 页面没写这张图就是它.

这 5 页里能用来记 Llama 的, 只有模型表那七行加 Llama 4 的两个名字. 层数, 注意力结构, 训练数据量, 评测分数都不在这里. 如果别的目录写了这些数字, 它们来自别的材料, 不能记在这 5 页上.
