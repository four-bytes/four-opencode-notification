import type { NotifyPayload, NotifyTarget } from "./types.js";

interface SendResult {
  success: boolean;
  error?: string;
}

/**
 * Sends a notification payload to a webhook URL.
 * Reads URL from environment variable (preferred) or target.url fallback.
 * Never throws — always returns structured result.
 */
export class WebhookSender {
  async send(target: NotifyTarget, payload: NotifyPayload): Promise<SendResult> {
    const url = process.env[target.env] || target.url;

    if (!url) {
      return { success: false, error: `env var ${target.env} not set` };
    }

    try {
      const { formatForProvider } = await import("./formatters/index.js");
      const body = formatForProvider(target.provider, payload);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        return {
          success: false,
          error: `HTTP ${response.status}: ${text.slice(0, 200)}`,
        };
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }
}

export const webhookSender = new WebhookSender();
