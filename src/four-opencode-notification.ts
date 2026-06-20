import type { Plugin } from "@opencode-ai/plugin";
import { notifySendTool } from "./tools/notify-send.js";
import { createNotificationHooks } from "./hooks.js";

const FourOpencodeNotification: Plugin = async (ctx) => {
  // Log via opencode SDK (AGENTS.md convention: use client.app.log(), not console.*)
  ctx.client?.app
    ?.log({
      service: "four-opencode-notification",
      level: "info",
      message: `Plugin loaded in ${ctx.directory}`,
      extra: { directory: ctx.directory },
    })
    .catch(() => {
      // Silent — never throw from logging
    });

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

    "tool.execute.after": async (input) => {
      try {
        const { tool: toolName, args } = input;
        if (toolName === "notify_send" && args?.summary === true) {
          await hooks["work.finished"]({
            title: (args?.title as string) || "Untitled",
            body: (args?.body as string) || "",
            metadata: (args?.metadata as Record<string, string>) || {},
          });
        } else if (toolName === "question") {
          await hooks["question.asked"]({
            questions: (args?.questions as Array<{ question: string }>) || [],
          });
        }
      } catch {
        // Silent
      }
    },
  };
};

export default FourOpencodeNotification;
