import "server-only";

import { createHash } from "node:crypto";

export type OpenAIAdsEventType = "lead_created" | "appointment_scheduled";

type ConversionInput = {
  eventId: string;
  type: OpenAIAdsEventType;
  sourceUrl: string;
  oppref?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  optedOut?: boolean;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function sanitizeSourceUrl(
  candidate: string | undefined,
  requestOrigin: string,
  pathname: string
) {
  const configuredOrigin = process.env.OPENAI_ADS_SITE_ORIGIN;
  const trustedOrigins = new Set<string>();

  for (const origin of [configuredOrigin, requestOrigin]) {
    if (!origin) continue;
    try {
      const parsed = new URL(origin);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        trustedOrigins.add(parsed.origin);
      }
    } catch {
      // Invalid origins are ignored and never used as trust anchors.
    }
  }

  if (candidate) {
    try {
      const parsed = new URL(candidate);
      if (
        (parsed.protocol === "http:" || parsed.protocol === "https:") &&
        trustedOrigins.has(parsed.origin)
      ) {
        return `${parsed.origin}${parsed.pathname}`;
      }
    } catch {
      // Fall through to the canonical origin.
    }
  }

  const fallbackOrigin = configuredOrigin ?? requestOrigin;
  const parsedFallback = new URL(fallbackOrigin);
  if (parsedFallback.protocol !== "http:" && parsedFallback.protocol !== "https:") {
    throw new Error("OpenAI Ads site origin must use HTTP(S)");
  }

  return `${parsedFallback.origin}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export async function sendOpenAIAdsConversion(input: ConversionInput) {
  try {
    const pixelId = process.env.OPENAI_ADS_PIXEL_ID;
    const apiKey = process.env.OPENAI_ADS_CONVERSIONS_API_KEY;
    if (!pixelId || !apiKey) return;

    const user: Record<string, string> = {};
    if (input.email) user.email_sha256 = sha256(normalizeEmail(input.email));
    if (input.ipAddress) user.ip_address = input.ipAddress;
    if (input.userAgent) user.user_agent = input.userAgent;

    const event: Record<string, unknown> = {
      id: input.eventId,
      type: input.type,
      timestamp_ms: Date.now(),
      action_source: "web",
      source_url: input.sourceUrl,
      data: { type: "customer_action" }
    };

    if (input.oppref) event.oppref = input.oppref;
    if (Object.keys(user).length > 0) event.user = user;
    if (input.optedOut) event.opt_out = true;

    await fetch(
      `https://bzr.openai.com/v1/events?pid=${encodeURIComponent(pixelId)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          validate_only: process.env.OPENAI_ADS_VALIDATE_ONLY === "true",
          events: [event]
        }),
        signal: AbortSignal.timeout(1500)
      }
    );
  } catch {
    // Measurement is best-effort and must never fail the lead flow.
  }
}
