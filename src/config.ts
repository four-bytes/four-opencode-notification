import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { NotifyConfig } from "./types.js";

/**
 * Load notification config from `.opencode/notify.json` in the project directory.
 * Returns `{ targets: [] }` if the config file is not found — plugin loads but is inactive.
 */
export function loadNotifyConfig(cwd: string): NotifyConfig {
  const configPath = join(cwd, ".opencode", "notify.json");

  if (!existsSync(configPath)) return { targets: [] };

  try {
    const raw = readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw) as NotifyConfig;

    if (!parsed.targets || !Array.isArray(parsed.targets)) return { targets: [] };

    return parsed;
  } catch {
    return { targets: [] };
  }
}
