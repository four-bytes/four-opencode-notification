import type { NotifyPayload } from "../types.js";

/**
 * MS Teams formatter — returns JSON for Teams Workflows / Power Automate.
 * NOT legacy connector cards. The Power Automate workflow maps these fields to adaptive cards.
 */
export function format(payload: NotifyPayload): object {
  return {
    title: payload.title,
    body: payload.body,
    level: payload.level,
    summary: payload.summary || false,
    timestamp: new Date().toISOString(),
    facts: metadataFacts(payload.metadata),
  };
}

function metadataFacts(metadata?: Record<string, string>): Array<{ name: string; value: string }> {
  if (!metadata) return [];
  return Object.entries(metadata).map(([name, value]) => ({ name, value }));
}
