import "server-only";

export const supportedConversionTypes = ["lead_created", "appointment_scheduled"] as const;
export type ConversionType = (typeof supportedConversionTypes)[number];

export type ConversionInput = {
  id: string;
  type: ConversionType;
  timestampMs: number;
  sourceUrl: string;
  oppref?: string;
  emailSha256?: string;
  externalIdSha256?: string;
  ipAddress?: string;
  userAgent?: string;
  optOut?: boolean;
};

export function sanitizeSourceUrl(candidate: string) {
  const configuredOrigin = process.env.OPENAI_ADS_SITE_ORIGIN;
  if (!configuredOrigin) throw new Error("OPENAI_ADS_SITE_ORIGIN is not configured");

  const trusted = new URL(configuredOrigin);
  const parsed = new URL(candidate);
  if (!["http:", "https:"].includes(trusted.protocol) || !["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP(S) source URLs are allowed");
  }
  if (parsed.origin !== trusted.origin) throw new Error("Untrusted source URL origin");

  return `${parsed.origin}${parsed.pathname}`;
}

export async function sendOpenAIAdsConversion(input: ConversionInput) {
  const pixelId = process.env.OPENAI_ADS_PIXEL_ID;
  const apiKey = process.env.OPENAI_ADS_CONVERSIONS_API_KEY;
  if (!pixelId || !apiKey) throw new Error("OpenAI Ads is not configured");

  const user: Record<string, string> = {};
  if (input.emailSha256) user.email_sha256 = input.emailSha256;
  if (input.externalIdSha256) user.external_id_sha256 = input.externalIdSha256;
  if (input.ipAddress) user.ip_address = input.ipAddress;
  if (input.userAgent) user.user_agent = input.userAgent;

  const event: Record<string, unknown> = {
    id: input.id,
    type: input.type,
    timestamp_ms: input.timestampMs,
    action_source: "web",
    source_url: sanitizeSourceUrl(input.sourceUrl),
    data: { type: "customer_action" }
  };

  if (input.oppref) event.oppref = input.oppref;
  if (Object.keys(user).length > 0) event.user = user;
  if (input.optOut) event.opt_out = true;

  const response = await fetch(`https://bzr.openai.com/v1/events?pid=${encodeURIComponent(pixelId)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      validate_only: process.env.OPENAI_ADS_VALIDATE_ONLY === "true",
      events: [event]
    }),
    signal: AbortSignal.timeout(2000),
    cache: "no-store"
  });

  if (!response.ok) throw new Error(`OpenAI Ads rejected conversion (${response.status})`);
}
