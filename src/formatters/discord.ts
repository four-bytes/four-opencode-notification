import type { NotifyPayload } from "../types.js";

/**
 * Discord webhook formatter — returns Discord webhook JSON with embeds.
 */
export function format(payload: NotifyPayload): object {
  const color = levelColor(payload.level);
  const timestamp = new Date().toISOString();

  return {
    content: `**${payload.title}**\n${payload.body}`,
    embeds: [
      {
        title: payload.title,
        description: payload.body,
        color,
        timestamp,
        fields: metadataFields(payload.metadata),
        footer: payload.summary
          ? { text: "Session summary (final)" }
          : undefined,
      },
    ],
  };
}

function levelColor(level: string): number {
  switch (level) {
    case "error":
      return 0xff0000;
    case "warn":
      return 0xffa500;
    case "info":
      return 0x00ff00;
    default:
      return 0x808080;
  }
}

function metadataFields(metadata?: Record<string, string>): Array<{ name: string; value: string }> {
  if (!metadata) return [];
  return Object.entries(metadata).map(([name, value]) => ({ name, value }));
}
