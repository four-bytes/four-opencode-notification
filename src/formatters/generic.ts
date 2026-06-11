import type { NotifyPayload } from "../types.js";

/**
 * Generic webhook formatter — plain JSON suitable for any webhook consumer.
 */
export function format(payload: NotifyPayload): object {
  return {
    title: payload.title,
    body: payload.body,
    level: payload.level,
    summary: payload.summary || false,
    timestamp: new Date().toISOString(),
    ...(payload.metadata || {}),
  };
}
