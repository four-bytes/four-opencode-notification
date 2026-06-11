import type { Plugin } from "@opencode-ai/plugin";
import { notifySendTool } from "./tools/notify-send.js";
import { notificationHooks } from "./hooks.js";
import { logDebugEvent } from "./debug-logger.js";

const FourOpencodeNotification: Plugin = async (ctx) => {
  logDebugEvent("plugin.loaded", { directory: ctx.directory });

  return {
    tool: {
      notify_send: notifySendTool,
    },

    /**
     * Event handler — dispatches to named hook functions based on event type.
     */
    event: async (input) => {
      const { type, properties } = input.event;

      try {
        if (type === "session.idle") {
          await notificationHooks["session.idle"]({ properties });
        } else if (type === "session.error") {
          await notificationHooks["session.error"]({ properties });
        }
      } catch {
        // Silent — never throw from event hooks
      }
    },

    /**
     * Permission hook — dispatches when permission is asked.
     */
    "permission.ask": async (input, output) => {
      try {
        await notificationHooks["permission.asked"]({
          permission: input.permission,
          patterns: input.patterns,
        });
        // Never change output.status — pass through
      } catch {
        // Silent — never throw from permission hooks
      }
    },
  };
};

export default FourOpencodeNotification;
