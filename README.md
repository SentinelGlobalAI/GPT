# Sentinel Global Web

Next.js website and conversion instrumentation for [sentinelglobal.ai](https://sentinelglobal.ai).

## OpenAI Ads measurement

The app implements consent-gated Pixel + Conversions API measurement for confirmed leads.

- Pixel initialization occurs once in the root layout.
- `lead_created` fires only after Resend accepts the inquiry email.
- Pixel and CAPI share the server-generated `leadId` for deduplication.
- CAPI reads raw `__oppref` attribution from the server cookie.
- Browser `sourceUrl` is accepted only from the request or configured canonical origin and is stripped to origin + pathname.
- Email is normalized and SHA-256 hashed before Pixel/CAPI measurement.
- The CAPI key is server-only and measurement failures cannot fail the lead flow.

## Configuration

Copy `.env.example` to `.env.local` and set:

1. `NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID` and `OPENAI_ADS_PIXEL_ID` to the same Ads Manager Pixel ID.
2. `OPENAI_ADS_CONVERSIONS_API_KEY` to the server-only CAPI credential.
3. `RESEND_API_KEY`, `LEAD_NOTIFICATION_EMAIL`, and a verified `LEAD_FROM_EMAIL`.

Keep `OPENAI_ADS_VALIDATE_ONLY=false` in production. Set it to `true` only for a local CAPI schema smoke test.

## Local development

```bash
npm install
npm run dev
```

Run checks with:

```bash
npm run typecheck
npm run lint
npm run build
```

Before deploying, review the implementation against your privacy policy, consent requirements, and data-handling rules.
