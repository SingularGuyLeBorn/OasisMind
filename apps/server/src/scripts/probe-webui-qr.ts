import fs from "fs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { loadRootEnv } from "../infra/config.js";

loadRootEnv();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
let buf = fs.readFileSync(path.join(root, "tools/napcat_framework/config/webui.json"));
if (buf[0] === 0xef) buf = buf.subarray(3);
const token = JSON.parse(buf.toString("utf8")).token as string;
const hash = crypto.createHash("sha256").update(`${token}.napcat`).digest("hex");
const login = await fetch("http://127.0.0.1:6099/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ hash }),
});
const cred = ((await login.json()) as { data?: { Credential?: string } })?.data?.Credential;
console.log("login", login.status, !!cred);

const paths = [
  "/api/QQLogin/GetQQLoginQrcode",
  "/api/QQLogin/GetQRcode",
  "/api/QQLogin/QQGetQRcode",
  "/api/QQLogin/GetLoginQrCode",
  "/api/QQLogin/CheckLoginStatus",
  "/api/QQLogin/GetQQLoginInfo",
  "/api/QQLogin/GetQuickLoginList",
];
for (const p of paths) {
  try {
    const r = await fetch(`http://127.0.0.1:6099${p}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cred}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      signal: AbortSignal.timeout(5000),
    });
    console.log(p, r.status, (await r.text()).slice(0, 220).replace(/\s+/g, " "));
  } catch (e) {
    console.log(p, e instanceof Error ? e.message : e);
  }
}
