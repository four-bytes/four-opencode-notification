import type { NotifyPayload } from "../types.js";

/**
 * Slack webhook formatter — returns Slack webhook JSON with blocks and color-coded attachments.
 */
export function format(payload: NotifyPayload): object {
  const color = levelColor(payload.level);

  return {
    text: `*${payload.title}*\n${payload.body}`,
    attachments: [
      {
        color,
        title: payload.title,
        text: payload.body,
        fields: metadataFields(payload.metadata),
        footer: payload.summary ? "Session summary (final)" : undefined,
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };
}

function levelColor(level: string): string {
  switch (level) {
    case "error":
      return "danger";
    case "warn":
      return "warning";
    case "info":
      return "good";
    default:
      return "#808080";
  }
}

function metadataFields(metadata?: Record<string, string>): Array<{ title: string; value: string; short: boolean }> {
  if (!metadata) return [];
  return Object.entries(metadata).map(([title, value]) => ({
    title,
    value,
    short: true,
  }));
}
