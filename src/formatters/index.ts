import type { Provider, NotifyPayload } from "../types.js";
import { format as formatDiscord } from "./discord.js";
import { format as formatSlack } from "./slack.js";
import { format as formatMsteams } from "./msteams.js";
import { format as formatGeneric } from "./generic.js";

/**
 * Dispatch payload formatting to the correct provider formatter.
 */
export function formatForProvider(
  provider: Provider,
  payload: NotifyPayload,
  format?: "adaptive" | "flat",
): object {
  switch (provider) {
    case "discord":
      return formatDiscord(payload);
    case "slack":
      return formatSlack(payload);
    case "msteams":
      return formatMsteams(payload, format ?? "flat");
    case "generic":
      return formatGeneric(payload);
    default:
      return formatGeneric(payload);
  }
}
