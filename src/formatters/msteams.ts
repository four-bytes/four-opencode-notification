// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2025-2026 Four Bytes

import type { NotifyPayload } from "../types.js";

/**
 * MS Teams formatter — flat JSON for Power Automate / Workflows.
 *
 * The Power Automate template expects top-level fields:
 *   title  → bold header
 *   body   → text (newlines become <br> in the template)
 *
 * Additional fields (level, summary, metadata) are included
 * as top-level keys for optional use in the workflow template.
 */
export function format(payload: NotifyPayload): object {
  const levelPrefix =
    payload.level === "error" ? "🔴 "
    : payload.level === "warn" ? "🟡 "
    : "🔵 ";

  const result: Record<string, unknown> = {
    title: `${levelPrefix}${payload.title}`,
    body: payload.body,
    level: payload.level,
    summary: payload.summary || false,
  };

  // Flatten metadata into top-level fields (e.g., project → "project: value")
  if (payload.metadata) {
    for (const [key, value] of Object.entries(payload.metadata)) {
      result[key] = value;
    }
  }

  return result;
}
