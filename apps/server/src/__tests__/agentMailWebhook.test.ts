/**
 * AgentMail webhook 验签：公网/生产无 secret 必须 fail-closed；本地无 secret 仍放行。
 */

import { afterEach, describe, expect, it } from "vitest";
import { verifyAgentMailWebhook } from "../infra/agentMailClient.js";

const ENV_KEYS = [
  "AGENTMAIL_WEBHOOK_SECRET",
  "PUBLIC_URL",
  "CLOUDFLARE_TUNNEL_TOKEN",
] as const;

const saved: Record<string, string | undefined> = {};

function snapshotEnv() {
  for (const key of ENV_KEYS) saved[key] = process.env[key];
}

function restoreEnv() {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
}

function clearProbeEnv() {
  for (const key of ENV_KEYS) delete process.env[key];
}

describe("verifyAgentMailWebhook", () => {
  snapshotEnv();
  afterEach(() => {
    restoreEnv();
  });

  it("无 secret + PUBLIC_URL 拒绝（公网 fail-closed）", () => {
    clearProbeEnv();
    process.env.PUBLIC_URL = "https://example.trycloudflare.com";
    expect(verifyAgentMailWebhook({ headers: {} })).toBe(false);
  });

  it("无 secret + 生产 NODE_ENV 拒绝", () => {
    clearProbeEnv();
    const prevNode = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    expect(verifyAgentMailWebhook({ headers: { "x-agentmail-secret": "x" } })).toBe(false);
    if (prevNode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNode;
  });

  it("无 secret + 纯本地放行", () => {
    clearProbeEnv();
    const prevNode = process.env.NODE_ENV;
    process.env.NODE_ENV = "test";
    expect(verifyAgentMailWebhook({ headers: {} })).toBe(true);
    if (prevNode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNode;
  });

  it("secret 匹配放行、不匹配拒绝", () => {
    clearProbeEnv();
    process.env.AGENTMAIL_WEBHOOK_SECRET = "webhook-secret";
    expect(
      verifyAgentMailWebhook({ headers: { "x-agentmail-secret": "webhook-secret" } }),
    ).toBe(true);
    expect(
      verifyAgentMailWebhook({ headers: { "x-agentmail-secret": "wrong" } }),
    ).toBe(false);
    expect(verifyAgentMailWebhook({ headers: {} })).toBe(false);
  });
});
