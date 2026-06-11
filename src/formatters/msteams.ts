// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2025-2026 Four Bytes

import type { NotifyPayload } from "../types.js";

/**
 * MS Teams formatter — Adaptive Card for Power Automate / Workflows.
 *
 * Output schema:
 * {
 *   "type": "message",
 *   "attachments": [{
 *     "contentType": "application/vnd.microsoft.card.adaptive",
 *     "contentUrl": null,
 *     "content": {
 *       "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
 *       "type": "AdaptiveCard",
 *       "version": "1.4",
 *       "body": [...]
 *     }
 *   }]
 * }
 */
export function format(payload: NotifyPayload): object {
  const body: Array<Record<string, unknown>> = [];

  // Level emoji prefix
  const levelPrefix =
    payload.level === "error" ? "🔴 "
    : payload.level === "warn" ? "🟡 "
    : "🔵 ";

  // Title — bold TextBlock
  body.push({
    type: "TextBlock",
    text: `${levelPrefix}${payload.title}`,
    weight: "Bolder",
    size: "Medium",
    wrap: true,
  });

  // Body — split by newlines, each line a separate TextBlock
  for (const line of payload.body.split("\n")) {
    const trimmed = line.trim();
    if (trimmed) {
      body.push({
        type: "TextBlock",
        text: trimmed,
        wrap: true,
      });
    }
  }

  // Metadata facts — show as subtitle TextBlocks if present
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
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body,
        },
      },
    ],
  };
}
