# Sentinel Global Ads Measurement Gateway

Standalone server-side conversion gateway for Sentinel Global web properties. The public website remains independently hosted and branded. This service owns OpenAI Ads CAPI delivery and exposes one authenticated server-to-server conversion endpoint.

## Architecture

1. The website confirms a lead or appointment and creates a stable event ID.
2. The website server posts the conversion to `POST /api/conversions` using `SENTINEL_ADS_INGEST_KEY`.
3. The browser Pixel emits the same event type and `event_id`.
4. OpenAI Ads deduplicates the browser and CAPI events.

The endpoint accepts only `lead_created` and `appointment_scheduled`. It rejects browser cross-origin preflight requests, untrusted source origins, invalid timestamps, raw identity values and unsupported events.

## Gateway environment

```text
OPENAI_ADS_PIXEL_ID=
OPENAI_ADS_CONVERSIONS_API_KEY=
OPENAI_ADS_SITE_ORIGIN=https://sentinelglobal.ai
OPENAI_ADS_VALIDATE_ONLY=false
SENTINEL_ADS_INGEST_KEY=
```

Never prefix the CAPI or ingest keys with `NEXT_PUBLIC_`.

## Website server integration

The website server hashes normalized email before sending it. Conversion delivery must be bounded and non-blocking so measurement cannot fail the lead or booking flow.

```ts
import { createHash, randomUUID } from "node:crypto";

const eventId = randomUUID();
const emailSha256 = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");

void fetch(`${process.env.SENTINEL_ADS_GATEWAY_URL}/api/conversions`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.SENTINEL_ADS_INGEST_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    id: eventId,
    type: "lead_created",
    timestamp_ms: Date.now(),
    source_url: sourceUrl,
    oppref: rawOpprefCookie,
    user: { email_sha256: emailSha256, user_agent: userAgent, ip_address: ipAddress }
  }),
  signal: AbortSignal.timeout(1500)
}).catch(() => {});
```

Return `eventId` to the browser only after the core action succeeds. The browser then emits:

```ts
window.oaiq?.("measure", "lead_created", { type: "customer_action" }, { event_id: eventId });
```

Use the same pattern with `appointment_scheduled` after a scheduler confirms the booking.

Before deployment, review the implementation against applicable privacy, security, consent and data-handling requirements.
