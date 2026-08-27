import { describe, expect, it } from "vitest";
import { assertPublicHttpUrl } from "../infra/safeHttpUrl.js";

describe("assertPublicHttpUrl", () => {
  it("放行公网 https", () => {
    expect(assertPublicHttpUrl("https://example.com/a").hostname).toBe("example.com");
  });

  it("拒绝 file 与 javascript", () => {
    expect(() => assertPublicHttpUrl("file:///etc/passwd")).toThrow(/仅支持 http/);
    expect(() => assertPublicHttpUrl("javascript:alert(1)")).toThrow(/仅支持 http|非法/);
  });

  it("拒绝回环与私网", () => {
    expect(() => assertPublicHttpUrl("http://127.0.0.1/")).toThrow(/私网或回环/);
    expect(() => assertPublicHttpUrl("http://localhost:3010/health")).toThrow(/本机/);
    expect(() => assertPublicHttpUrl("http://192.168.1.8/admin")).toThrow(/私网或回环/);
    expect(() => assertPublicHttpUrl("http://10.0.0.1/")).toThrow(/私网或回环/);
    expect(() => assertPublicHttpUrl("http://169.254.169.254/latest/meta-data")).toThrow(/私网或回环/);
  });
});
