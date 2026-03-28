import { Request, Response } from "express";
import { extractClientIp } from "../../src/middleware/geolocate";

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    ip: "",
    socket: { remoteAddress: "" },
    ...overrides,
  } as unknown as Request;
}

describe("extractClientIp", () => {
  it("returns the first IP from X-Forwarded-For", () => {
    const req = makeReq({ headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1, 10.0.0.2" } });
    expect(extractClientIp(req)).toBe("203.0.113.5");
  });

  it("falls back to X-Real-IP when XFF is absent", () => {
    const req = makeReq({ headers: { "x-real-ip": "203.0.113.9" } });
    expect(extractClientIp(req)).toBe("203.0.113.9");
  });

  it("falls back to req.ip when no proxy headers present", () => {
    const req = makeReq({ headers: {}, ip: "203.0.113.20" });
    expect(extractClientIp(req)).toBe("203.0.113.20");
  });

  it("falls back to socket.remoteAddress as last resort", () => {
    const req = makeReq({ headers: {}, ip: "", socket: { remoteAddress: "203.0.113.99" } as any });
    expect(extractClientIp(req)).toBe("203.0.113.99");
  });

  it("handles array-valued X-Forwarded-For header", () => {
    const req = makeReq({ headers: { "x-forwarded-for": ["203.0.113.7, 10.0.0.1"] } });
    expect(extractClientIp(req)).toBe("203.0.113.7");
  });
});
