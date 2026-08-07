/**
 * NapCat / OneBot 已退役：手机指挥改走 QQ 开放平台官方 Bot（QQ_BOT_*）。
 * 本脚本保留空壳，防止旧命令/旧进程配置误拉起掉线邮件与 QQ 登录。
 */
console.log(
  "[napcat] 已退役。请使用 QQ 官方 Bot：配置 QQ_BOT_APP_ID / QQ_BOT_SECRET / QQ_BOT_WS=true。" +
    "不再拉起 QQ/NapCat，也不会发掉线邮件。",
);
process.exit(0);
