/**
 * Native 域工具注册入口
 * PR-4a：fs / web / shell；PR-4b：swarm / session / memory；PR-4c：integration。
 * 由 nativeTools.ensureNativeToolsRegistered 调用；按 AppConfig.packs 跳过未启用域。
 */
import { domainAllowed, type PackFlags } from "@knowpilot/shared";
import { registerFsTools } from "./fs.js";
import { registerWebTools } from "./web/register.js";
import { registerDokobotTools } from "./dokobot.js";
import { registerWebbridgeTools } from "./webbridge.js";
import { registerShellTools } from "./shell.js";
import { registerSwarmTools } from "./swarm/register.js";
import { registerSessionTools } from "./session/register.js";
import { registerMemoryTools } from "./memory.js";
import { registerIntegrationTools } from "./integration.js";
import { registerNotifyTools } from "./notify.js";
import { registerAskUserTools } from "./askUser.js";
import { registerSkillsTools } from "./skills.js";
import { registerExperimentTools } from "./experiment.js";
import { registerInboxTools } from "./inbox.js";
import { registerDeployTools } from "./deploy.js";
import { registerAlgoVizTools } from "./algoViz.js";
import { registerArticleVideoTools } from "./articleVideo.js";
import { registerMediaSttTools } from "./mediaStt.js";
import { registerAgentCronTools } from "./agentCron.js";
import { registerLiteratureTools } from "./literature.js";
import { registerDocumentTools } from "./document.js";
import { registerQqTools } from "./qq.js";

type DomainRegistrar = { domain: Parameters<typeof domainAllowed>[0]; register: () => void };

const DOMAIN_REGISTRARS: DomainRegistrar[] = [
  { domain: "fs", register: registerFsTools },
  { domain: "web", register: registerWebTools },
  { domain: "web", register: registerDokobotTools },
  { domain: "web", register: registerWebbridgeTools },
  { domain: "shell", register: registerShellTools },
  { domain: "swarm", register: registerSwarmTools },
  { domain: "session", register: registerSessionTools },
  { domain: "memory", register: registerMemoryTools },
  { domain: "integration", register: registerIntegrationTools },
  { domain: "notify", register: registerNotifyTools },
  { domain: "askUser", register: registerAskUserTools },
  { domain: "skills", register: registerSkillsTools },
  { domain: "skills", register: registerExperimentTools },
  { domain: "inbox", register: registerInboxTools },
  { domain: "deploy", register: registerDeployTools },
  { domain: "algoViz", register: registerAlgoVizTools },
  { domain: "articleVideo", register: registerArticleVideoTools },
  { domain: "mediaStt", register: registerMediaSttTools },
  { domain: "agentCron", register: registerAgentCronTools },
  { domain: "literature", register: registerLiteratureTools },
  { domain: "document", register: registerDocumentTools },
  { domain: "qq", register: registerQqTools },
];

export function registerNativeDomains(packs: PackFlags): void {
  for (const { domain, register } of DOMAIN_REGISTRARS) {
    if (domainAllowed(domain, packs)) register();
  }
}

export type { NativeToolContext, NativeToolDefinition, NativeToolHandler } from "./types.js";
export { coerceToolBoolean } from "./types.js";
export {
  syncSearchEnvFromConfig,
  isUnreadableArticlePage,
  readArticleContentWarning,
} from "./web/register.js";
