import { loadNotifyConfig } from "./config.js";
import { webhookSender } from "./webhook-sender.js";
import { rateLimiter } from "./rate-limiter.js";
import type { NotifyPayload, NotifyTarget } from "./types.js";

type ToastFn = (message: string, variant?: "info" | "success" | "warning" | "error", title?: string) => void;

async function sendToRoutes(
  config: ReturnType<typeof loadNotifyConfig>,
  eventName: string,
  payload: NotifyPayload,
): Promise<void> {
  const routeIds = config.routes?.[eventName];
  if (!routeIds || routeIds.length === 0) return;

  const targetMap = new Map<string, NotifyTarget>(
    config.targets.map((t) => [t.id, t]),
  );

  const throttleSecs = config.defaults?.throttleSeconds ?? 120;

  for (const tid of routeIds) {
    const target = targetMap.get(tid);
    if (!target || target.enabled === false) continue;

    const targetThrottle = target.throttleSeconds ?? throttleSecs;
    if (!rateLimiter.canSend(tid, targetThrottle)) continue;

    await webhookSender.send(target, payload).catch(() => {
      // Silent — never throw from hooks
    });
  }
}

export function createNotificationHooks(toast: ToastFn) {
  return {
    "session.idle": async (event: {
      properties?: { sessionID?: string };
    }) => {
      const cwd = process.cwd();
      const config = loadNotifyConfig(cwd);

      if (!config.routes?.["session.idle"]) return;

      const include = config.defaults?.include ?? [];
      const metadata: Record<string, string> = {};
      if (include.includes("project")) metadata.project = cwd.split("/").pop() || cwd;
      if (include.includes("sessionId") && event.properties?.sessionID)
        metadata.sessionId = event.properties.sessionID;

      await sendToRoutes(config, "session.idle", {
        title: "Session complete",
        body: `Session completed at ${new Date().toISOString()}`,
        level: "info",
        summary: config.defaults?.summaryMode === "final",
        metadata,
      });

      toast("Webhook sent — session completed", "success", "Notification");
    },

    "session.error": async (event: {
      properties?: {
        sessionID?: string;
        error?: { message?: string; name?: string };
      };
    }) => {
      const cwd = process.cwd();
      const config = loadNotifyConfig(cwd);

      if (!config.routes?.["session.error"]) return;

      const errorMsg =
        event.properties?.error?.message ||
        event.properties?.error?.name ||
        "Unknown error";

      await sendToRoutes(config, "session.error", {
        title: "Session error",
        body: errorMsg,
        level: "error",
        metadata: {
          project: cwd.split("/").pop() || cwd,
        },
      });

      toast(`Webhook sent — ${errorMsg.substring(0, 60)}`, "error", "Notification");
    },

    "permission.asked": async (event: {
      permission?: string;
      patterns?: string[];
    }) => {
      const cwd = process.cwd();
      const config = loadNotifyConfig(cwd);

      if (!config.routes?.["permission.asked"]) return;

      const command = event.permission || "unknown";
      const patterns = event.patterns?.join(", ") || "none";

      await sendToRoutes(config, "permission.asked", {
        title: "Permission requested",
        body: `Permission: ${command}\nPatterns: ${patterns}`,
        level: "warn",
        metadata: {
          project: cwd.split("/").pop() || cwd,
          command,
        },
      });

      toast(`Webhook sent — permission: ${command}`, "warning", "Notification");
    },
  };
}
