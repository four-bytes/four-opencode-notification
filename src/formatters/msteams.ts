// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2025-2026 Four Bytes

import type { NotifyPayload } from "../types.js";

const levelPrefix = (level: string) =>
  level === "error" ? "🔴 " : level === "warn" ? "🟡 " : "🔵 ";

/** Adaptive Card format — rich Teams card with structured layout */
function formatAdaptive(payload: NotifyPayload): object {
  const body: Array<Record<string, unknown>> = [];

  body.push({
    type: "TextBlock",
    text: `${levelPrefix(payload.level)}${payload.title}`,
    weight: "Bolder",
    size: "Medium",
    wrap: true,
  });

  for (const line of payload.body.split("\n")) {
    const trimmed = line.trim();
    if (trimmed) {
      body.push({ type: "TextBlock", text: trimmed, wrap: true });
    }
  }

  if (payload.metadata) {
    for (const [key, value] of Object.entries(payload.metadata)) {
      body.push({
        type: "TextBlock",
        text: `${key}: ${value}`,
        wrap: true,
        size: "Small",
        isSubtle: true,
      });
    }
  }

  return {
    type: "message",
    attachments: [{
      contentType: "application/vnd.microsoft.card.adaptive",
      contentUrl: null,
      content: {
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
        type: "AdaptiveCard",
        version: "1.4",
        body,
      },
    }],
  };
}

/** Flat JSON format — for Power Automate templates that expect top-level fields */
function formatFlat(payload: NotifyPayload): object {
  const result: Record<string, unknown> = {
    title: `${levelPrefix(payload.level)}${payload.title}`,
    body: payload.body,
    level: payload.level,
    summary: payload.summary || false,
  };

  if (payload.metadata) {
    for (const [key, value] of Object.entries(payload.metadata)) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Format a notification payload for MS Teams.
 * @param payload — the notification data
 * @param format — "adaptive" (rich card) or "flat" (simple JSON, default)
 */
export function format(payload: NotifyPayload, cardFormat: "adaptive" | "flat" = "flat"): object {
  return cardFormat === "adaptive"
    ? formatAdaptive(payload)
    : formatFlat(payload);
}
