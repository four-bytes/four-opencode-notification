import type { Plugin } from "@opencode-ai/plugin";
import { notifySendTool } from "./tools/notify-send.js";
import { createNotificationHooks } from "./hooks.js";
import { logDebugEvent } from "./debug-logger.js";

const FourOpencodeNotification: Plugin = async (ctx) => {
  logDebugEvent("plugin.loaded", { directory: ctx.directory });

  // Toast wrapper — calls opencode TUI toast API
  const toast = (
    message: string,
    variant: "info" | "success" | "warning" | "error" = "info",
    title?: string,
  ) => {
    try {
      (ctx.client as any)?.tui?.showToast?.({
        message,
        variant,
        title,
        duration: 5000,
      });
    } catch {
      // Silent — never throw from toast
    }
  };

  const hooks = createNotificationHooks(toast);

  return {
    tool: {
      notify_send: notifySendTool,
    },

    event: async (input) => {
      const { type, properties } = input.event;

      try {
        if (type === "session.idle") {
          await hooks["session.idle"]({ properties });
        } else if (type === "session.error") {
          await hooks["session.error"]({ properties });
        }
      } catch {
        // Silent — never throw from event hooks
      }
    },

    "permission.ask": async (input, output) => {
      try {
        await hooks["permission.asked"]({
          permission: input.permission,
          patterns: input.patterns,
        });
      } catch {
        // Silent — never throw from permission hooks
      }
    },
  };
};

export default FourOpencodeNotification;
