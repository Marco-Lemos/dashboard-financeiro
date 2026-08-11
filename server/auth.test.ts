import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function makeContext(user: TrpcContext["user"] = null): TrpcContext {
  return {
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
    user,
  };
}

describe("system.health", () => {
  it("responds without requiring authentication", async () => {
    const caller = appRouter.createCaller(makeContext());
    const result = await caller.system.health({ timestamp: Date.now() });
    expect(result.ok).toBe(true);
  });
});

describe("auth.me", () => {
  it("returns null when there is no authenticated user", async () => {
    const caller = appRouter.createCaller(makeContext(null));
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});
