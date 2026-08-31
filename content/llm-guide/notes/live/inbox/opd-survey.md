# opd-survey 回传

租约：`4.6-OPD/4.6.2-OPD综述/` + 本文件。知乎只学讲法，不当事实源。

## 一手

| 题目 | URL | 写进哪 |
|------|-----|--------|
| Song & Zheng. *A Survey of On-Policy Distillation for Large Language Models*（Tencent；自称 first comprehensive OPD survey） | https://arxiv.org/abs/2604.00626 | `4.6.2/01-OPD综述` |
| 同上 HTML v3 | https://arxiv.org/html/2604.00626v3 | 式 (1)(8)(9)；三轴；白盒/黑盒/teacher-free；§8 工业 |
| Awesome-LLM-On-Policy-Distillation | https://github.com/nick7nlp/Awesome-LLM-On-Policy-Distillation | 综述作者附属列表 |
| Wang et al. *Demystifying On-Policy Distillation* | https://arxiv.org/html/2607.13399 | 链 07：探索催化剂 / mismatch / 长度作弊 |
| Fu et al. *Revisiting On-Policy Distillation* | https://arxiv.org/html/2603.25562 | 链 07：sampled-token 三病 / top-K 局部支撑 |
| Shen et al. GxPO 综述（只钉边界，不写家族专文） | https://arxiv.org/html/2606.16733 | 纯散度 OPD 退出 $J(\theta)$；GRPO-OPD hybrid 留在 PG 框 |
| MiniLLM | https://arxiv.org/abs/2306.08543 | 沿用 01 |
| GKD | https://arxiv.org/abs/2306.13649 | 沿用 01 |
| Qwen3 Table 21 | https://arxiv.org/html/2505.09388 | 分母只链 01/10 |

## 知乎（讲法，禁止搬正文）

| 题目 | URL | 学什么（合上） |
|------|-----|----------------|
| 【Part-1】【OPD综述】三万字长文精讲 2026 上半年的 On-Policy Distillation（Lei Tian） | https://zhuanlan.zhihu.com/p/2045918254108095918 | 正交轴：读完一篇就能放进坐标系，不要按公司拆 |
| 大语言模型 On Policy 策略蒸馏(OPD)综述（欠阿贝尔两块钱） | https://zhuanlan.zhihu.com/p/2025613859377955868 | 把综述三轴说成「反馈 / 教师访问 / …」时，回 HTML 核对官方三轴是 优化什么 / 信号从哪来 / 怎么稳定 |
| On-Policy Distillation (OPD):起源、发展路线与当今现状（翞翞翞） | https://zhuanlan.zhihu.com/p/2037285722151989443 | 失败论文清单当索引，数字回 arXiv |
| On-Policy Distillation(OPD)相关工作整理（欠阿贝尔两块钱） | https://zhuanlan.zhihu.com/p/2074302205256119340 | 综述条目提纲 |
| LLM On-Policy Distillation 综述（龟壳） | https://zhuanlan.zhihu.com/p/2026734015428699432 | 章节走法：离线→同策略；不当公式源 |

## 质检备忘

- 不是 Preference / 不是 DPO / 不是「OPD = GRPO」。
- MiniLLM = reverse KL + policy gradient；GKD = 学生前缀上的 KL、不对采样反传。Qwen3 未点名正/反向 KL。
- Table 21：Qwen3-8B、同一 off-policy distilled 8B、只比 math+code；17,920 vs 1,800 GPU hours；AIME'24 67.6→74.4。不要安到 V4。
