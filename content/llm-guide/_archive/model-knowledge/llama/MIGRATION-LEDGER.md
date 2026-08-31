---
title: "Llama 旧第 14 章逐文件迁移账本"
category: "内部归档"
tags: ["llama", "迁移账本", "sha256", "git-lfs"]
published: false
as_of: "2026-09-01"
excerpt: "Llama 旧树 95 个文件的逐文件去向与迁移前完整性记录。"
---

# Llama 旧第 14 章逐文件迁移账本

迁移前总计 95 个文件：30 篇 Markdown 与 65 个附件。其中文档/普通附件按迁移前工作树字节记录 SHA-256；63 个 Git LFS 附件按仓库指针记录对象 OID 与 size。source-* 表示报告或来源快照，archive-* 表示二次解读、重复导航、误置材料或其专属附件。

> Markdown 迁移后可能只改动本地链接与归档导航，因此表中普通文件散列用于证明迁移前身份；LFS 资产必须与表中 OID/size 完全一致。

| 旧相对路径 | 处置 | 新相对路径 | 迁移前完整性 |
|---|---|---|---|
| 01-Llama-1/01-Llama-1技术报告精译.md | source-markdown | _sources/model-reports/llama/llama/01-Llama-1技术报告精译.md | SHA-256 `62dd67fc4b20007e4e8a752f110bb8326fa7e01a2220073a35107d5f21a44f15`；bytes 47317 |
| 01-Llama-1/02-Llama-1核心架构剖析.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/01-Llama-1/02-Llama-1核心架构剖析.md | SHA-256 `ae3106a90407281648a798e438cd56e7ea15f3c0fd558070f8242eb98838a2c7`；bytes 16352 |
| 01-Llama-1/03-Llama-1-mineru-en.md | source-markdown | _sources/model-reports/llama/llama/03-Llama-1-mineru-en.md | SHA-256 `ce4b7b31710640eb6c59e07b649d358cd34950c344ed1774ac02225055a1cf61`；bytes 89090 |
| 01-Llama-1/04-Llama-1-mineru-zh.md | source-markdown | _sources/model-reports/llama/llama/04-Llama-1-mineru-zh.md | SHA-256 `2cb65424588d2e1ca38f7cb7739f75f9cdbc8c06b4ace41675ccab2ff61ae3a9`；bytes 177173 |
| 01-Llama-1/05-Llama-1-Architecture-Overview.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/01-Llama-1/05-Llama-1-Architecture-Overview.md | SHA-256 `7e31bb17ce6f883c6363632b267898a225b1241c5f49ae75755e03866aef9d89`；bytes 18521 |
| 01-Llama-1/05-Llama-1-Index.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/01-Llama-1/05-Llama-1-Index.md | SHA-256 `1578df8ea2ecefce29a15ac2a9ac99361ee6694d3df63e7ebecb21df1ddf2904`；bytes 420 |
| 01-Llama-1/images/all_evals.pdf | source-asset | _sources/model-reports/llama/llama/images/all_evals.pdf | LFS OID `sha256:023559d0b4d66bb5531fe5083bcabd8f933b9cefe7cd3d4ddbfecf55cf85ecdf`；size 43913 |
| 01-Llama-1/images/train_loss.pdf | source-asset | _sources/model-reports/llama/llama/images/train_loss.pdf | LFS OID `sha256:97a9af6d3bcd18ec1fd08621ff81126e4756013b31db62522c1bf6c32856ab4c`；size 265784 |
| 01-Llama-1/pdfs/Llama-1.pdf | source-asset | _sources/model-reports/llama/llama/pdfs/Llama-1.pdf | LFS OID `sha256:2e663675ae36ad12adb2f5a05281bac2747ecf8d23d92bedd9f937a89fee7136`；size 726566 |
| 02-Llama-2/01-Llama-2技术报告精译.md | source-markdown | _sources/model-reports/llama/llama2/01-Llama-2技术报告精译.md | SHA-256 `a22f0bba103b15a7411b9a1cd7ba0cb20858db8f094d4c2e0e309c8aadb28099`；bytes 42671 |
| 02-Llama-2/02-Llama-2核心架构剖析.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/02-Llama-2/02-Llama-2核心架构剖析.md | SHA-256 `8499d72b70d0c036b4cd72a93243ab4b95627a641e396c1711e2e2954d750320`；bytes 14692 |
| 02-Llama-2/03-Llama-2-RLHF与安全对齐精读.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/02-Llama-2/03-Llama-2-RLHF与安全对齐精读.md | SHA-256 `ed103eb2804390854c308554e39f4ceef159bde23d4887a371e9eb640cc05056`；bytes 3013 |
| 02-Llama-2/03-Llama-2-mineru-en.md | source-markdown | _sources/model-reports/llama/llama2/03-Llama-2-mineru-en.md | SHA-256 `28119553f43d2bf2a953c6e65e559b30b0d57b87cfbae41489ae3454cc45f2bc`；bytes 265956 |
| 02-Llama-2/04-Llama-2-mineru-zh.md | source-markdown | _sources/model-reports/llama/llama2/04-Llama-2-mineru-zh.md | SHA-256 `56e8805595199e71f4ba2877e04de8971b199cc3223d63625655f4e03f8bbe55`；bytes 414800 |
| 02-Llama-2/05-Llama-2-Architecture-Overview.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/02-Llama-2/05-Llama-2-Architecture-Overview.md | SHA-256 `bfaa126b5036ee7402334b7d8d83eef477c8e99aba8d799d55832085f3ea53e5`；bytes 19840 |
| 02-Llama-2/05-Llama-2-Index.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/02-Llama-2/05-Llama-2-Index.md | SHA-256 `549714254bd8fff4ceb189df052028258c824fd6132ff92f8ccc7b177a63b3fc`；bytes 406 |
| 02-Llama-2/05-Llama-2-RLHF.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/02-Llama-2/05-Llama-2-RLHF.md | SHA-256 `9b5b5bf31c0e77d360cc7865334e56c245614286ff7777bca9ee8139efa64746`；bytes 24029 |
| 02-Llama-2/images/RLHF_chart2.jpg | source-asset | _sources/model-reports/llama/llama2/images/RLHF_chart2.jpg | LFS OID `sha256:a29f1244f8b03e0a1d0607f39d6103ccfed80e0bb8f36123bc06ab41acff8dc0`；size 1196649 |
| 02-Llama-2/images/evolution_of_chatllama_GPT4.pdf | source-asset | _sources/model-reports/llama/llama2/images/evolution_of_chatllama_GPT4.pdf | LFS OID `sha256:c6a453bb82ce69d704b0d161f8bc1808e8488cca2cd53c77f51b5e7c56fd8136`；size 13334 |
| 02-Llama-2/images/evolution_of_chatllama_RM.pdf | source-asset | _sources/model-reports/llama/llama2/images/evolution_of_chatllama_RM.pdf | LFS OID `sha256:5d19b5e339239d4774b992122c005d7aa1c1786867b333555acb14a1cea2e54e`；size 13384 |
| 02-Llama-2/images/fig1_gpt4_eval.pdf | source-asset | _sources/model-reports/llama/llama2/images/fig1_gpt4_eval.pdf | LFS OID `sha256:fb9e4800d3eef43fe40141e7bdc81b455b7232008d65657c9501876620ba7085`；size 161693 |
| 02-Llama-2/images/loss_train.pdf | source-asset | _sources/model-reports/llama/llama2/images/loss_train.pdf | LFS OID `sha256:c451abcdb4334c05aede35dcfc626ca077ab334a759a74b41da89ae28b07953b`；size 50542 |
| 02-Llama-2/images/overall_win_rate_horizontal_white.pdf | source-asset | _sources/model-reports/llama/llama2/images/overall_win_rate_horizontal_white.pdf | LFS OID `sha256:e624ff65de6c9eee3dd72dd4f9a0df3d59f338fe9e6a7b41fd2f43f659a521a5`；size 206123 |
| 02-Llama-2/images/page16_img1.png | source-asset | _sources/model-reports/llama/llama2/images/page16_img1.png | LFS OID `sha256:186706bb5eff551788fc2e1a4294a20f235e0ec9ad1b472c358e54fee0f32212`；size 154715 |
| 02-Llama-2/images/page16_img2.png | source-asset | _sources/model-reports/llama/llama2/images/page16_img2.png | LFS OID `sha256:792ab177d873efe2710cca76a4489d96102d158363ecd452a19e560c19d25123`；size 530659 |
| 02-Llama-2/images/page19_img1.png | source-asset | _sources/model-reports/llama/llama2/images/page19_img1.png | LFS OID `sha256:8493f6a9a096227794e4b60d10e22799d332b50857c896c9a1bc9d8196769062`；size 107769 |
| 02-Llama-2/images/page21_img1.png | source-asset | _sources/model-reports/llama/llama2/images/page21_img1.png | LFS OID `sha256:d78aa40bbdbf34728e4f7330b81b6dcb2797c738bc8579156fcfcffb2bd2de7a`；size 15629 |
| 02-Llama-2/images/page28_img1.png | source-asset | _sources/model-reports/llama/llama2/images/page28_img1.png | LFS OID `sha256:ab448b884620b9cc61b86a5327fbc99f959154c90bd498e589955f2b43fb750c`；size 183135 |
| 02-Llama-2/images/page28_img2.png | source-asset | _sources/model-reports/llama/llama2/images/page28_img2.png | LFS OID `sha256:5a01ec02a226d0c7f22673c9e4aea505f62a8d9d31a3e1f7e19c6d3da288edbe`；size 4300 |
| 02-Llama-2/images/page30_img1.png | source-asset | _sources/model-reports/llama/llama2/images/page30_img1.png | LFS OID `sha256:d0a478e34c842312caf80ce5cddb6b1543c70522c5db24a2e1574aa2dc3441d6`；size 76478 |
| 02-Llama-2/images/page30_img2.png | source-asset | _sources/model-reports/llama/llama2/images/page30_img2.png | LFS OID `sha256:0e39cb0310e106785c95da4af9b52c3cf8365918d8bea8182007be58f0ec99dd`；size 84024 |
| 02-Llama-2/images/page30_img3.png | source-asset | _sources/model-reports/llama/llama2/images/page30_img3.png | LFS OID `sha256:8d5a43668d1d5eda628cd9c91f1016d743edcef1abc42d6adfbb2cd0a4e60292`；size 111800 |
| 02-Llama-2/images/page31_img1.png | source-asset | _sources/model-reports/llama/llama2/images/page31_img1.png | LFS OID `sha256:06d6f88e366e36d5a8b11c6ef50444b835ffd608c67e908fae3f91c7316c601b`；size 126279 |
| 02-Llama-2/images/page33_img1.png | source-asset | _sources/model-reports/llama/llama2/images/page33_img1.png | LFS OID `sha256:d1e717d64e8b5f1eb5e7fb5e472429ef046d6cf383bc362d43a88010d0caace0`；size 360347 |
| 02-Llama-2/images/page33_img2.png | source-asset | _sources/model-reports/llama/llama2/images/page33_img2.png | LFS OID `sha256:1873a4f8e79a96a73fd6c25c589e7386a08fb4586abec8cf78b7d83c9d94b042`；size 808536 |
| 02-Llama-2/images/page33_img3.png | source-asset | _sources/model-reports/llama/llama2/images/page33_img3.png | LFS OID `sha256:9df16f3b14371448dca236dcd5555e7e4c86fe97e7cedb7f9ffbd0469863772a`；size 1507505 |
| 02-Llama-2/images/page34_img1.png | source-asset | _sources/model-reports/llama/llama2/images/page34_img1.png | LFS OID `sha256:ce0b7bac78250eee2d692472e5c4e24e96876a7c3161446fc4d15ed165d40042`；size 1325042 |
| 02-Llama-2/images/page3_img1.jpeg | source-asset | _sources/model-reports/llama/llama2/images/page3_img1.jpeg | LFS OID `sha256:ea0bd6674c2aacc4f430bc92dbf26c3ce20fa19a53ea8927ff9aaf6658426ba3`；size 202172 |
| 02-Llama-2/images/page3_img2.png | source-asset | _sources/model-reports/llama/llama2/images/page3_img2.png | LFS OID `sha256:fd70e71a8216d0120b177660976c8b83deb6404abc2b2a5e011cf2d6c887a654`；size 125134 |
| 02-Llama-2/images/page48_img1.png | source-asset | _sources/model-reports/llama/llama2/images/page48_img1.png | LFS OID `sha256:a0102cd9ca30400591e78c55ae6d6b2a0276ec3c4accf2c06807f979b2436522`；size 160157 |
| 02-Llama-2/images/page4_img1.png | source-asset | _sources/model-reports/llama/llama2/images/page4_img1.png | LFS OID `sha256:d0a478e34c842312caf80ce5cddb6b1543c70522c5db24a2e1574aa2dc3441d6`；size 76478 |
| 02-Llama-2/images/page55_img1.png | source-asset | _sources/model-reports/llama/llama2/images/page55_img1.png | LFS OID `sha256:89b0323e8dbb6f8dbaf4f6ed28e96060ea99a1758c7a8e9d3812cbe62be7de8a`；size 901790 |
| 02-Llama-2/images/page55_img2.png | source-asset | _sources/model-reports/llama/llama2/images/page55_img2.png | LFS OID `sha256:fb97164af038a4356c054e73f253632d3a5637ff30331c16dd2a7d988d287b8a`；size 2246304 |
| 02-Llama-2/images/page57_img1.png | source-asset | _sources/model-reports/llama/llama2/images/page57_img1.png | LFS OID `sha256:59b0134a926fca6a4f6b3bd60246b0ec71fb212e78fe4addd3a2ab8d339a10db`；size 67421 |
| 02-Llama-2/images/page57_img2.png | source-asset | _sources/model-reports/llama/llama2/images/page57_img2.png | LFS OID `sha256:856cda0764dfcfd7da2912a5661b4a5681902177bbd2779d69afd7ed2f39707b`；size 81780 |
| 02-Llama-2/images/page58_img1.png | source-asset | _sources/model-reports/llama/llama2/images/page58_img1.png | LFS OID `sha256:d91470b05b98085bfd0a68afc0eeff55cb93a6d1ae22f0f17b5fcfc07f7258d4`；size 84384 |
| 02-Llama-2/images/page58_img2.png | source-asset | _sources/model-reports/llama/llama2/images/page58_img2.png | LFS OID `sha256:1ae644be1682f2fb1456892e825a8e789b0f949b404de166b1b1ddf5f42c0fd7`；size 80887 |
| 02-Llama-2/images/page5_img1.jpeg | source-asset | _sources/model-reports/llama/llama2/images/page5_img1.jpeg | LFS OID `sha256:a29f1244f8b03e0a1d0607f39d6103ccfed80e0bb8f36123bc06ab41acff8dc0`；size 1196649 |
| 02-Llama-2/images/safety_overall_human_temp.png | source-asset | _sources/model-reports/llama/llama2/images/safety_overall_human_temp.png | LFS OID `sha256:ba089fc8cf16f67c43e9f5bf1e77af2839725bcc094a54ecc7fa27d8234ee5e6`；size 64207 |
| 02-Llama-2/pdfs/Llama-2.pdf | source-asset | _sources/model-reports/llama/llama2/pdfs/Llama-2.pdf | LFS OID `sha256:1df284ce95f783002074bfe8f21d47c646b396ceb1736ea3ec0ea212fc070d91`；size 13661300 |
| 03-Llama-3/01-Llama-3技术报告精译.md | source-markdown | _sources/model-reports/llama/llama3-herd/01-Llama-3技术报告精译.md | SHA-256 `1a718adb5f85e85a4077a72f3cdfbfa8ee52dcdeb20f1dab50d05820c91f95c3`；bytes 53789 |
| 03-Llama-3/02-Llama-3核心架构剖析.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/03-Llama-3/02-Llama-3核心架构剖析.md | SHA-256 `c884417ed0cf3fadad2a972e6d988f46de3a72f3fc2665ab4242abe9a1717dfa`；bytes 12942 |
| 03-Llama-3/03-Llama-3-mineru-en.md | source-markdown | _sources/model-reports/llama/llama3-herd/03-Llama-3-mineru-en.md | SHA-256 `8abb232b10a9850d06845898d854b941dc7a51ba62bb361396d6cb92fbd40cd3`；bytes 359665 |
| 03-Llama-3/03-Llama-3集群失效分析精读.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/03-Llama-3/03-Llama-3集群失效分析精读.md | SHA-256 `455f7a004ddd54908e5fa88ebae61b1aa714cd63035f856f82803b1990fd6f1a`；bytes 15227 |
| 03-Llama-3/04-Llama-3-mineru-zh.md | source-markdown | _sources/model-reports/llama/llama3-herd/04-Llama-3-mineru-zh.md | SHA-256 `b833cc050f1fb7d522a40fb1f30a8ced0a16ee92ec3c441fa57cdfc375dff5c3`；bytes 635334 |
| 03-Llama-3/05-Llama-3-Architecture-Overview.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/03-Llama-3/05-Llama-3-Architecture-Overview.md | SHA-256 `98b607812fefc1507446bd0c994480b9cdd7e1c281bbedbb9adaca07cad8e859`；bytes 25414 |
| 03-Llama-3/05-Llama-3-Cluster-Failure-Analysis.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/03-Llama-3/05-Llama-3-Cluster-Failure-Analysis.md | SHA-256 `21944df434e9123e226ec28ef7fa0be77c5b8e7e7ec4ebeb719cbc98adadcec1`；bytes 22608 |
| 03-Llama-3/05-Llama-3-Index.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/03-Llama-3/05-Llama-3-Index.md | SHA-256 `991eea763545f9648b660c518559d6515c47eef30669d67d17c3bca2245d7a35`；bytes 4189 |
| 03-Llama-3/images/4D_parallelism.pdf | source-asset | _sources/model-reports/llama/llama3-herd/images/4D_parallelism.pdf | LFS OID `sha256:a25af9cd4d4c9f2cd27965691b0cd3bcaa53dba74204f67d130200ab3a585b17`；size 68271 |
| 03-Llama-3/images/FRR_VR_sys_model.pdf | source-asset | _sources/model-reports/llama/llama3-herd/images/FRR_VR_sys_model.pdf | LFS OID `sha256:bf8816540555988cfb9cb5e241c4f7210d8131ad845869c8e15082755a7710e8`；size 28149 |
| 03-Llama-3/images/code_translation_example.pdf | source-asset | _sources/model-reports/llama/llama3-herd/images/code_translation_example.pdf | LFS OID `sha256:07788e731fbdd1d880604e9f0b261191a69103e44dd042b479fadbf611f9b156`；size 140784 |
| 03-Llama-3/images/cyber-spear_phishing.pdf | source-asset | _sources/model-reports/llama/llama3-herd/images/cyber-spear_phishing.pdf | LFS OID `sha256:c52c50e36a1e10b64126283adb8ddbf43ad21f1b71c5c371861900764d23b9bb`；size 16541 |
| 03-Llama-3/images/cyber-text_prompt_injection.pdf | source-asset | _sources/model-reports/llama/llama3-herd/images/cyber-text_prompt_injection.pdf | LFS OID `sha256:57a3f0ba942dc776063813a05b35faf4bb511f1ed448d706163ece41d207fc2b`；size 21382 |
| 03-Llama-3/images/datacompute.pdf | source-asset | _sources/model-reports/llama/llama3-herd/images/datacompute.pdf | LFS OID `sha256:35e7a23e87f4549235d3ae718a03c873289a826e8ece5271840226d21850974f`；size 20928 |
| 03-Llama-3/images/isoflops.pdf | source-asset | _sources/model-reports/llama/llama3-herd/images/isoflops.pdf | LFS OID `sha256:f7e49cdb5262dec4c19383892545572672c4a54534c7a3374904ac2187958226`；size 33668 |
| 03-Llama-3/images/llama3_language_architecture.pdf | source-asset | _sources/model-reports/llama/llama3-herd/images/llama3_language_architecture.pdf | LFS OID `sha256:7dd97706f5ea8efe34962d36860b23a2ff5b46e58019133fd883df04ae3d5ce4`；size 54880 |
| 03-Llama-3/images/long_grouped_bar_comparison.pdf | source-asset | _sources/model-reports/llama/llama3-herd/images/long_grouped_bar_comparison.pdf | LFS OID `sha256:9dea95118645b9d6ab640c8668dbb35c38bea558ac6d65fbc1a8899f9dc91a82`；size 28112 |
| 03-Llama-3/images/ml_grouped_bar_comparison.pdf | source-asset | _sources/model-reports/llama/llama3-herd/images/ml_grouped_bar_comparison.pdf | LFS OID `sha256:6ed0ab41d905f7b9e8019fc10ed2c93419d966e30c09c9cca0e1e5840364cbb7`；size 29483 |
| 03-Llama-3/images/newplot_hailey.pdf | source-asset | _sources/model-reports/llama/llama3-herd/images/newplot_hailey.pdf | LFS OID `sha256:9cce78ba5a84d742b9cfbae78248680729427e0bab30aad868038c9b899a5c39`；size 23755 |
| 03-Llama-3/images/page1_img1.png | source-asset | _sources/model-reports/llama/llama3-herd/images/page1_img1.png | LFS OID `sha256:765d2b692fd9cec273e667424ca7c927ccf0c4c3d719cbba6bf61a965bab7dc7`；size 1066225 |
| 03-Llama-3/images/page21_img1.png | source-asset | _sources/model-reports/llama/llama3-herd/images/page21_img1.png | LFS OID `sha256:447d8afbe7f7243ee803404f95c1bb11e514b5871424a76b75d6da218aad3e10`；size 71111 |
| 03-Llama-3/images/page21_img2.png | source-asset | _sources/model-reports/llama/llama3-herd/images/page21_img2.png | LFS OID `sha256:de40b75b2a75d3a89c47d01273a1aa402f8910648a135359c2d2532138b02c01`；size 113238 |
| 03-Llama-3/images/page27_img1.png | source-asset | _sources/model-reports/llama/llama3-herd/images/page27_img1.png | LFS OID `sha256:21b84735c8d2561deb1cf8debaf5a5b234b8c2dda70c6d62bad16fa59690cef4`；size 1355426 |
| 03-Llama-3/images/page40_img1.jpeg | source-asset | _sources/model-reports/llama/llama3-herd/images/page40_img1.jpeg | LFS OID `sha256:f5ca3e5baaa38f7938cab0af16725581e7bb4ac0280c251651a00c0f0cc78a0c`；size 58215 |
| 03-Llama-3/images/page54_img1.png | source-asset | _sources/model-reports/llama/llama3-herd/images/page54_img1.png | LFS OID `sha256:e7b6de0de0363d34770db64c37508c01dd811b871431933dac999f6c6d444fa9`；size 60850 |
| 03-Llama-3/images/page54_img2.png | source-asset | _sources/model-reports/llama/llama3-herd/images/page54_img2.png | LFS OID `sha256:a12a9a296d873da436a49f5bbf5185495ce5810f48eed64ae33d46979c14b3f9`；size 75122 |
| 03-Llama-3/images/page63_img1.png | source-asset | _sources/model-reports/llama/llama3-herd/images/page63_img1.png | LFS OID `sha256:47c73d69cfad80e97fbe2cb5bc2e9437429183b312d109255d4a4aeb8d043943`；size 566587 |
| 03-Llama-3/images/pipeline_parallelism.pdf | source-asset | _sources/model-reports/llama/llama3-herd/images/pipeline_parallelism.pdf | LFS OID `sha256:6fd84dee45f68e6b76b9317f1d12ab007567fb66ce919ac869b233f97115a121`；size 100954 |
| 03-Llama-3/images/posttraining_overview.pdf | source-asset | _sources/model-reports/llama/llama3-herd/images/posttraining_overview.pdf | LFS OID `sha256:9b9c57cbe97fca9b538cbfec89e88e032f64461342da74388d1c96c83288e68e`；size 87319 |
| 03-Llama-3/images/scaling_laws_benchmark.pdf | source-asset | _sources/model-reports/llama/llama3-herd/images/scaling_laws_benchmark.pdf | LFS OID `sha256:3946fa2139cbfba9c684ac79c4f530b7827160b6a1da41f5958f99cbcedb03c6`；size 27605 |
| 03-Llama-3/pdfs/Llama-3.pdf | source-asset | _sources/model-reports/llama/llama3-herd/pdfs/Llama-3.pdf | LFS OID `sha256:481f1599468f95a07d05e97fafe55bbe786dc1624c6f881bcb4c7d14c933d083`；size 9833173 |
| 04-LLaMA-3.1/01-LLaMA-3.1-技术报告精译.md | source-markdown | _sources/model-reports/llama/llama3-1/01-LLaMA-3.1-技术报告精译.md | SHA-256 `5c17793648f24f88303cfc10be92e2367d68f0c25a99ba9fb2c8a8a9973e3a8e`；bytes 3060 |
| 04-LLaMA-3.1/05-04-LLaMA-3.1-核心技术专题.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/04-LLaMA-3.1/05-04-LLaMA-3.1-核心技术专题.md | SHA-256 `aa1db69032ad7523039e44ef4225bd9d3ecf9c5358b37acd748660396d320418`；bytes 10786 |
| 04-LLaMA-3.1/pdfs/LLaMA-3.1.html | source-asset | _sources/model-reports/llama/llama3-1/pdfs/LLaMA-3.1.html | SHA-256 `3114ed1860bc3cb00d380e09bbb91e670c37bb0cc21d2fdd8705b783a27004cb`；bytes 204899 |
| 04-Llama-4/01-Llama-4技术报告精译.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/04-Llama-4/01-Llama-4技术报告精译.md | SHA-256 `204b15bf3ecbf22acc6257774231482ee11e5dbedd701ef5e8c58ffb5b8823a7`；bytes 25578 |
| 04-Llama-4/05-Llama-4-Architecture-Overview.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/04-Llama-4/05-Llama-4-Architecture-Overview.md | SHA-256 `1e9ff25d6852d37f7cf6afbfc2aea2b4244c49bdce2114700ea53698b7613fc7`；bytes 23788 |
| 04-Llama-4/05-Llama-4-Index.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/04-Llama-4/05-Llama-4-Index.md | SHA-256 `314ef4a50926896c7e4df7974c2a9e3b186284cc378c546dfce0cd3adf23a97d`；bytes 393 |
| 04-Llama-4/pdfs/Llama-4.html | source-asset | _sources/model-reports/llama/llama4/pdfs/Llama-4.html | SHA-256 `a939a274c7ea7d9a7636bb2e9a2627d76a1ea031efcb1b635f1561b6f3d0f1e9`；bytes 199277 |
| 04-Llama-4/pdfs/Llama-4.pdf | source-asset | _sources/model-reports/llama/llama4/pdfs/Llama-4.pdf | LFS OID `sha256:99ef8d2eb99b4cee8e10f2a8142c6b1e31485db8bb33cb9b5dc6cb23d50c579d`；size 10693 |
| 05-Muse-Spark/01-Muse-Spark-公开材料精读.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/05-Muse-Spark/01-Muse-Spark-公开材料精读.md | SHA-256 `297c5918531d7eb4847f1b9ace955046fdf08dea9ef00de05664b82831920736`；bytes 22007 |
| 05-Muse-Spark/05-Muse-Spark-核心专题.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/05-Muse-Spark/05-Muse-Spark-核心专题.md | SHA-256 `26a59ff54835c19b12de539fe3c5aa5bb2a6a028b3ed2dd670bf5c408e6760eb`；bytes 794 |
| 05-Muse-Spark/images/fig-muse-spark-12-code-harness.png | archive-asset | _archive/model-knowledge/llama/legacy-ch14/05-Muse-Spark/images/fig-muse-spark-12-code-harness.png | LFS OID `sha256:3022346262425f654175e08d7fc1f2cce81e3d4fac1d9bae503ae563e795f347`；size 1487271 |
| 05-Muse-Spark/images/fig-muse-spark-prep-framework.png | archive-asset | _archive/model-knowledge/llama/legacy-ch14/05-Muse-Spark/images/fig-muse-spark-prep-framework.png | LFS OID `sha256:1c9d4860b46e447aa6db8403544f5bcd0824e824432ee61d22bd067d2e4ca872`；size 1282173 |
| 05-Muse-Spark/images/fig-muse-spark-prep-ladder.png | archive-asset | _archive/model-knowledge/llama/legacy-ch14/05-Muse-Spark/images/fig-muse-spark-prep-ladder.png | LFS OID `sha256:f21538fbcb64ce6682f05c3fb8057ce3efcb7d6f31d64002f2241257be3c6c66`；size 1344074 |
| 14.3-LLaMA.md | archive-markdown | _archive/model-knowledge/llama/legacy-ch14/14.3-LLaMA.md | SHA-256 `89a50ff8e0f8dacef840d25ca32b34d77c9f260fa2ff5c9e896d306af5c8a265`；bytes 826 |
