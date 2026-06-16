import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createNotificationHooks } from "../src/hooks.js";
import { webhookSender } from "../src/webhook-sender.js";
import { rateLimiter } from "../src/rate-limiter.js";

describe("Notification routes", () => {
  const origCwd = process.cwd;
  let testDir: string;
  let opencodeDir: string;
  let configPath: string;
  let toastCalls: Array<{ message: string; variant: string }>;
  let originalSend: typeof webhookSender.send;
  let sendCalls: Array<unknown[]>;

  const noopToast = (message: string, variant?: string) => {
    toastCalls.push({ message, variant: variant || "info" });
  };

  function setupConfig(cfg: Record<string, unknown>) {
    mkdirSync(opencodeDir, { recursive: true });
    writeFileSync(configPath, JSON.stringify(cfg), "utf-8");
  }

  beforeEach(() => {
    testDir = join(tmpdir(), "notify-routes-test-" + Date.now() + "-" + Math.random().toString(36).slice(2));
    opencodeDir = join(testDir, ".opencode");
    configPath = join(opencodeDir, "notify.json");
    toastCalls = [];
    sendCalls = [];

    // Mock process.cwd to return testDir
    process.cwd = () => testDir;
  });

  afterEach(() => {
    process.cwd = origCwd;
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("work.finished", () => {
    beforeEach(() => {
      rateLimiter.reset("test-target");
      // Save and mock webhookSender.send
      originalSend = webhookSender.send;
      webhookSender.send = async (_target: any, _payload: any) => {
        sendCalls.push([_target, _payload]);
        return { success: true };
      };
    });

    afterEach(() => {
      webhookSender.send = originalSend;
    });

    test("skips when route not configured", async () => {
      setupConfig({
        targets: [{ id: "test-target", provider: "generic", env: "TEST_ENV" }],
        // No "work.finished" route
      });

      const hooks = createNotificationHooks(noopToast);
      await hooks["work.finished"]({
        title: "My task",
        body: "Done!",
      });

      expect(sendCalls.length).toBe(0);
    });

    test("sends when route is configured", async () => {
      setupConfig({
        targets: [{ id: "test-target", provider: "generic", env: "TEST_ENV" }],
        routes: { "work.finished": ["test-target"] },
        defaults: { throttleSeconds: 0 },
      });

      const hooks = createNotificationHooks(noopToast);
      await hooks["work.finished"]({
        title: "My task",
        body: "All work completed!",
        metadata: { customKey: "customValue" },
      });

      expect(sendCalls.length).toBe(1);

      const calledPayload = sendCalls[0][1];
      expect(calledPayload.title).toBe("Work finished: My task");
      expect(calledPayload.body).toBe("All work completed!");
      expect(calledPayload.level).toBe("info");
      expect(calledPayload.summary).toBe(true);
      expect(calledPayload.metadata).toMatchObject({
        project: testDir.split("/").pop(),
        customKey: "customValue",
      });
    });
  });

  describe("question.asked", () => {
    beforeEach(() => {
      rateLimiter.reset("test-target");
      // Save and mock webhookSender.send
      originalSend = webhookSender.send;
      webhookSender.send = async (_target: any, _payload: any) => {
        sendCalls.push([_target, _payload]);
        return { success: true };
      };
    });

    afterEach(() => {
      webhookSender.send = originalSend;
    });

    test("skips when route not configured", async () => {
      setupConfig({
        targets: [{ id: "test-target", provider: "generic", env: "TEST_ENV" }],
        // No "question.asked" route
      });

      const hooks = createNotificationHooks(noopToast);
      await hooks["question.asked"]({
        questions: [{ question: "Are you sure?" }],
      });

      expect(sendCalls.length).toBe(0);
    });

    test("sends when route is configured", async () => {
      setupConfig({
        targets: [{ id: "test-target", provider: "generic", env: "TEST_ENV" }],
        routes: { "question.asked": ["test-target"] },
        defaults: { throttleSeconds: 0 },
      });

      const hooks = createNotificationHooks(noopToast);
      await hooks["question.asked"]({
        questions: [{ question: "Allow this operation?" }],
      });

      expect(sendCalls.length).toBe(1);

      const calledPayload = sendCalls[0][1];
      expect(calledPayload.title).toBe("Question asked");
      expect(calledPayload.body).toBe("Allow this operation?");
      expect(calledPayload.level).toBe("warn");
      expect(calledPayload.metadata).toMatchObject({
        project: testDir.split("/").pop(),
      });
    });

    test("long question text is truncated to 200 chars", async () => {
      setupConfig({
        targets: [{ id: "test-target", provider: "generic", env: "TEST_ENV" }],
        routes: { "question.asked": ["test-target"] },
        defaults: { throttleSeconds: 0 },
      });

      const longQuestion = "A".repeat(300);
      const hooks = createNotificationHooks(noopToast);
      await hooks["question.asked"]({
        questions: [{ question: longQuestion }],
      });

      expect(sendCalls.length).toBe(1);

      const calledPayload = sendCalls[0][1];
      expect(calledPayload.body.length).toBe(200);
      expect(calledPayload.body).toBe("A".repeat(200));
    });
  });
});
