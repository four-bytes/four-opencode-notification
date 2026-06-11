export type Provider = "discord" | "slack" | "msteams" | "generic";

export interface NotifyTarget {
  id: string;
  provider: Provider;
  env: string;
  url?: string;
  enabled?: boolean;
  throttleSeconds?: number;
}

export interface NotifyConfig {
  defaults?: {
    provider?: Provider;
    throttleSeconds?: number;
    summaryMode?: "brief" | "final";
    include?: string[];
  };
  targets: NotifyTarget[];
  routes?: Record<string, string[]>;
  tools?: {
    notify_send?: {
      defaultTargets?: string[];
    };
  };
}

export interface NotifyPayload {
  title: string;
  body: string;
  level: "info" | "warn" | "error";
  summary?: boolean;
  metadata?: Record<string, string>;
}
