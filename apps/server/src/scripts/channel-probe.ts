/**
 * QQ / 微信通道体检 CLI。
 *
 * 默认只检查本地配置；`--live` 才访问平台，而且永不发送消息。输出与退出码适合人和 Agent：
 * 0=全部就绪，1=平台/配置错误，2=尚未配置或尚未登录。
 */
import { getAppConfig, loadRootEnv } from "../infra/config.js";
import {
  probeAllChannels,
  probeChannel,
  type ChannelProbeName,
  type ChannelProbeReport,
} from "../infra/channels/channelDiagnostics.js";

type CliOptions = {
  channel: ChannelProbeName | "all";
  live: boolean;
  json: boolean;
  help: boolean;
};

function helpText(): string {
  return `见微 QQ / 微信通道体检

用法：
  pnpm channel:probe -- [--channel qq|weixin|all] [--live] [--json]

参数：
  --channel <name>  体检 qq、weixin 或 all；默认 all
  --live            访问真实平台，但不发送消息
  --json            输出稳定 JSON，供 Agent/脚本读取
  --help            显示帮助

退出码：
  0  请求的通道全部就绪
  1  配置或真实平台探测失败
  2  尚未配置凭据 / 尚未扫码登录

真实探测行为：
  QQ：获取 access token，并读取 gateway 地址。
  微信：无会话时只验证二维码端点；有会话时只申请 1 字节测试上传槽，
        不上传文件、不消费入站消息、不发送微信消息。
`;
}

export function parseChannelProbeArgs(argv: string[]): CliOptions {
  let channel: CliOptions["channel"] = "all";
  let live = false;
  let json = false;
  let help = false;
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]!;
    // pnpm 根脚本再转发到 workspace 时会保留一个独立的 `--`，它只是参数分隔符。
    if (arg === "--") continue;
    if (arg === "--live") live = true;
    else if (arg === "--json") json = true;
    else if (arg === "--help" || arg === "-h") help = true;
    else if (arg === "--channel") {
      const value = argv[++index];
      if (value !== "qq" && value !== "weixin" && value !== "all") {
        throw new Error("--channel 必须是 qq、weixin 或 all");
      }
      channel = value;
    } else {
      throw new Error(`未知参数：${arg}`);
    }
  }
  return { channel, live, json, help };
}

function reportExitCode(reports: ChannelProbeReport[]): number {
  if (reports.every((report) => report.ok)) return 0;
  if (reports.some((report) => report.checks.some((check) => check.status === "failed") && report.configured)) {
    return 1;
  }
  return 2;
}

function printHuman(reports: ChannelProbeReport[]): void {
  for (const report of reports) {
    console.log(`\n${report.ok ? "通过" : "未就绪"} · ${report.name} · ${report.live ? "真实平台" : "本地配置"}`);
    console.log(
      `  能力：收 ${report.capabilities.inbound.join("/")}；发 ${report.capabilities.outbound.join("/")}；上限 ${Math.round(report.capabilities.maxBytes / 1024 / 1024)} MB`,
    );
    for (const check of report.checks) {
      const mark = check.status === "passed" ? "✓" : check.status === "failed" ? "✗" : check.status === "warning" ? "!" : "-";
      const latency = check.latencyMs === undefined ? "" : ` (${check.latencyMs}ms)`;
      console.log(`  ${mark} ${check.name}${latency}：${check.detail}`);
    }
    if (report.nextAction) console.log(`  下一步：${report.nextAction}`);
  }
}

async function main(): Promise<void> {
  const options = parseChannelProbeArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }

  loadRootEnv();
  const config = getAppConfig();
  const probeOptions = { live: options.live, dataDir: config.dataDir };
  const reports = options.channel === "all"
    ? await probeAllChannels(probeOptions)
    : [await probeChannel(options.channel, probeOptions)];

  if (options.json) {
    console.log(JSON.stringify({ schemaVersion: 1, reports }, null, 2));
  } else {
    printHuman(reports);
  }
  process.exitCode = reportExitCode(reports);
}

const invokedDirectly = process.argv[1]?.replace(/\\/g, "/").endsWith("/channel-probe.ts");
if (invokedDirectly) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
