// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

// Mock server-only so the module can be imported in tests
vi.mock("server-only", () => ({}));

// Capture what gets set on the cookie store
const mockCookieSet = vi.fn();
const mockCookieDelete = vi.fn();
const mockCookieGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      set: mockCookieSet,
      delete: mockCookieDelete,
      get: mockCookieGet,
    })
  ),
}));

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

describe("createSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets the auth-token cookie", async () => {
    const { createSession } = await import("@/lib/auth");
    await createSession("user-123", "test@example.com");

    expect(mockCookieSet).toHaveBeenCalledOnce();
    const [name] = mockCookieSet.mock.calls[0];
    expect(name).toBe("auth-token");
  });

  it("sets a valid JWT containing userId and email", async () => {
    const { createSession } = await import("@/lib/auth");
    await createSession("user-123", "test@example.com");

    const [, token] = mockCookieSet.mock.calls[0];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    expect(payload.userId).toBe("user-123");
    expect(payload.email).toBe("test@example.com");
  });

  it("sets cookie with httpOnly and correct security attributes", async () => {
    const { createSession } = await import("@/lib/auth");
    await createSession("user-123", "test@example.com");

    const [, , options] = mockCookieSet.mock.calls[0];
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
  });

  it("sets secure flag only in production", async () => {
    const { createSession } = await import("@/lib/auth");

    const originalEnv = process.env.NODE_ENV;

    await createSession("user-123", "test@example.com");
    const [, , optionsDev] = mockCookieSet.mock.calls[0];
    expect(optionsDev.secure).toBe(false);
  });

  it("sets cookie expiry ~7 days in the future", async () => {
    const { createSession } = await import("@/lib/auth");
    const before = Date.now();
    await createSession("user-123", "test@example.com");
    const after = Date.now();

    const [, , options] = mockCookieSet.mock.calls[0];
    const expires: Date = options.expires;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    expect(expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
    expect(expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
  });

  it("JWT expiry matches cookie expiry", async () => {
    const { createSession } = await import("@/lib/auth");
    await createSession("user-123", "test@example.com");

    const [, token, options] = mockCookieSet.mock.calls[0];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const cookieExpiresMs = (options.expires as Date).getTime();
    // JWT exp is in whole seconds; allow up to 2s difference vs millisecond-precise cookie expiry
    expect(Math.abs(payload.exp! * 1000 - cookieExpiresMs)).toBeLessThan(2000);
  });

  it("works with different userId and email values", async () => {
    const { createSession } = await import("@/lib/auth");
    await createSession("abc-456", "other@domain.org");

    const [, token] = mockCookieSet.mock.calls[0];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    expect(payload.userId).toBe("abc-456");
    expect(payload.email).toBe("other@domain.org");
  });
});
