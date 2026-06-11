import { tool } from "@opencode-ai/plugin";
import { loadNotifyConfig } from "../config.js";
import { webhookSender } from "../webhook-sender.js";
import { rateLimiter } from "../rate-limiter.js";
import type { NotifyTarget } from "../types.js";

export const notifySendTool = tool({
  description:
    "Send notification to configured targets (Discord, Slack, MS Teams, generic webhooks). Use for session summaries, error alerts, and explicit progress updates.",
  args: {
    title: tool.schema.string().describe("Notification title"),
    body: tool.schema.string().describe("Notification body (markdown supported)"),
    targets: tool.schema
      .string()
      .array()
      .describe("Target IDs to send to (defaults to tool.defaultTargets)"),
    level: tool.schema.string().describe("info | warn | error (default: info)"),
    summary: tool.schema
      .boolean()
      .describe("Mark as final summary (triggers session wrap-up)"),
    metadata: tool.schema.object().describe("Extra fields included in payload"),
  },
  async execute(args, ctx) {
    const { title, body, targets, level = "info", summary = false, metadata } = args;

    if (!title || !body) return "Error: title and body are required";

    const config = loadNotifyConfig(ctx.directory);

    const activeTargets = config.targets.filter(
      (t) => t.enabled !== false,
    );

    if (activeTargets.length === 0) return "No notification targets configured";

    const targetIds = targets && targets.length > 0
      ? targets
      : config.tools?.notify_send?.defaultTargets || activeTargets.map((t) => t.id);

    const results: string[] = [];
    const payload = {
      title,
      body,
      level: level as "info" | "warn" | "error",
      summary,
      metadata: metadata as Record<string, string> | undefined,
    };

    const throttleSecs = config.defaults?.throttleSeconds ?? 120;

    const targetMap = new Map<string, NotifyTarget>(
      activeTargets.map((t) => [t.id, t]),
    );

    for (const tid of targetIds) {
      const target = targetMap.get(tid);
      if (!target) {
        results.push(`✗ ${tid} (unknown target)`);
        continue;
      }

      const targetThrottle = target.throttleSeconds ?? throttleSecs;
      if (!rateLimiter.canSend(tid, targetThrottle)) {
        results.push(`⏳ ${tid} (throttled)`);
        continue;
      }

      const result = await webhookSender.send(target, payload);
      if (result.success) {
        results.push(`✓ ${tid}`);
      } else {
        results.push(`✗ ${tid} (${result.error})`);
      }
    }

    const sent = results.filter((r) => r.startsWith("✓")).length;
    const total = results.length;
    return `Sent to ${sent}/${total} targets:\n${results.join("\n")}`;
  },
});
