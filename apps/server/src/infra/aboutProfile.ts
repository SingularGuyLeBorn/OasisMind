/** About Me 的本地文件入口；解析与公开版共用，不引入第二种资料格式。 */
import fs from "node:fs";
import path from "node:path";
import { parseAboutProfile, type AboutProfile } from "@oasismind/shared";
import { getAppConfig } from "./config.js";

export function loadAboutProfile(): AboutProfile {
  const config = getAppConfig();
  const envPath = process.env.ABOUT_PROFILE_PATH?.trim();
  const filePath = envPath ? path.resolve(envPath) : path.join(config.contentPaths.about, "profile.md");
  return parseAboutProfile(fs.readFileSync(filePath, "utf8"));
}
