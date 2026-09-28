/**
 * CREDENTIAL_MASTER_KEY 加密落库路径（globalSetup 已注入测试 key）。
 */
import { describe, expect, it } from "vitest";
import {
  assertCredentialEncryptionAvailable,
  decryptCredentialValue,
  encryptCredentialValue,
} from "../infra/credentialVault.js";

describe("credentialVault 加密", () => {
  it("有 master key 时落库为 enc: 前缀且可解密", () => {
    expect(process.env.CREDENTIAL_MASTER_KEY?.length).toBeGreaterThanOrEqual(32);
    const enc = encryptCredentialValue("super-secret-token");
    expect(enc.startsWith("enc:")).toBe(true);
    expect(enc).not.toContain("super-secret-token");
    expect(decryptCredentialValue(enc)).toBe("super-secret-token");
  });

  it("明文旧值无前缀时原样返回（兼容历史）", () => {
    expect(decryptCredentialValue("legacy-plain")).toBe("legacy-plain");
  });

  it("生产环境无 CREDENTIAL_MASTER_KEY 必须抛错（拒启动，不能只 warn）", () => {
    const prevEnv = process.env.NODE_ENV;
    const prevKey = process.env.CREDENTIAL_MASTER_KEY;
    try {
      process.env.NODE_ENV = "production";
      delete process.env.CREDENTIAL_MASTER_KEY;
      expect(() => assertCredentialEncryptionAvailable()).toThrow(/CREDENTIAL_MASTER_KEY/);
    } finally {
      process.env.NODE_ENV = prevEnv;
      if (prevKey === undefined) delete process.env.CREDENTIAL_MASTER_KEY;
      else process.env.CREDENTIAL_MASTER_KEY = prevKey;
    }
  });

  it("开发环境无 master key 只 warn 不抛", () => {
    const prevEnv = process.env.NODE_ENV;
    const prevKey = process.env.CREDENTIAL_MASTER_KEY;
    try {
      process.env.NODE_ENV = "development";
      delete process.env.CREDENTIAL_MASTER_KEY;
      expect(() => assertCredentialEncryptionAvailable()).not.toThrow();
    } finally {
      process.env.NODE_ENV = prevEnv;
      if (prevKey === undefined) delete process.env.CREDENTIAL_MASTER_KEY;
      else process.env.CREDENTIAL_MASTER_KEY = prevKey;
    }
  });
});
