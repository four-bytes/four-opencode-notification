import { describe, expect, test, beforeEach } from "bun:test";
import { rateLimiter } from "../src/rate-limiter.js";

describe("RateLimiter", () => {
  beforeEach(() => {
    rateLimiter.reset("test-target");
    rateLimiter.reset("target-2");
  });

  test("allows first send", () => {
    expect(rateLimiter.canSend("test-target", 60)).toBe(true);
  });

  test("blocks second send within throttle window", () => {
    expect(rateLimiter.canSend("test-target", 60)).toBe(true);
    expect(rateLimiter.canSend("test-target", 60)).toBe(false);
  });

  test("allows send after reset", () => {
    expect(rateLimiter.canSend("test-target", 60)).toBe(true);
    rateLimiter.reset("test-target");
    expect(rateLimiter.canSend("test-target", 60)).toBe(true);
  });

  test("independent targets do not interfere", () => {
    expect(rateLimiter.canSend("test-target", 60)).toBe(true);
    expect(rateLimiter.canSend("target-2", 60)).toBe(true);
    expect(rateLimiter.canSend("test-target", 60)).toBe(false);
    expect(rateLimiter.canSend("target-2", 60)).toBe(false);
  });

  test("respects different throttle values", () => {
    // Throttle of 0 should allow repeated sends
    expect(rateLimiter.canSend("test-target", 0)).toBe(true);
    expect(rateLimiter.canSend("test-target", 0)).toBe(true);

    rateLimiter.reset("test-target");

    // Throttle of 9999 should block
    expect(rateLimiter.canSend("test-target", 9999)).toBe(true);
    expect(rateLimiter.canSend("test-target", 9999)).toBe(false);
  });
});
