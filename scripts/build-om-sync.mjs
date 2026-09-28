/**
 * 构建 tools/om-sync（Rust 内容扫描器，db:sync 的 Post 全量扫描依赖它）。
 *
 * [OM-FREEPLAY] 用户只要求接线 om-sync；本脚本是为「新机器/CI 上二进制缺失时有一条
 * 标准构建入口」而补的配套基建。定位顺序：PATH 上的 cargo → 项目内私有工具链
 * tools/rust/{cargo,rustup}（需带 CARGO_HOME/RUSTUP_HOME 环境变量）。
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isWin = process.platform === "win32";
const cargoBin = isWin ? "cargo.exe" : "cargo";

/** 返回 { command, env }；找不到工具链返回 null */
function locateCargo() {
  const onPath = spawnSync(cargoBin, ["--version"], { stdio: "ignore" });
  if (!onPath.error && onPath.status === 0) {
    return { command: cargoBin, env: { ...process.env } };
  }

  const cargoHome = path.join(root, "tools", "rust", "cargo");
  const rustupHome = path.join(root, "tools", "rust", "rustup");
  const localCargo = path.join(cargoHome, "bin", cargoBin);
  if (fs.existsSync(localCargo)) {
    return {
      command: localCargo,
      env: { ...process.env, CARGO_HOME: cargoHome, RUSTUP_HOME: rustupHome },
    };
  }
  return null;
}

const cargo = locateCargo();
if (!cargo) {
  console.error(
    "❌ 未找到 Rust 工具链（PATH 无 cargo，tools/rust/ 下也没有项目私有工具链）。\n" +
      "   请先安装 Rust：https://rustup.rs/",
  );
  process.exit(1);
}

console.log(`🔧 构建 om-sync（${cargo.command}）...`);
const result = spawnSync(
  cargo.command,
  ["build", "--release", "--manifest-path", path.join("tools", "om-sync", "Cargo.toml")],
  { stdio: "inherit", env: cargo.env, cwd: root },
);
if (result.status !== 0) {
  console.error("❌ om-sync 构建失败");
  process.exit(result.status ?? 1);
}
console.log("✅ om-sync 构建完成：tools/om-sync/target/release/");
