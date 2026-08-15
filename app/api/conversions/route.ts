import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { isAuthorized } from "@/lib/ingest-auth";
import { sendOpenAIAdsConversion, supportedConversionTypes } from "@/lib/openai-ads";

const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const conversionSchema = z.object({
  id: z.string().trim().min(8).max(128),
  type: z.enum(supportedConversionTypes),
  timestamp_ms: z.number().int(),
  source_url: z.string().url().max(2048),
  oppref: z.string().max(4096).optional(),
  user: z.object({
    email_sha256: sha256.optional(),
    external_id_sha256: sha256.optional(),
    ip_address: z.string().max(64).optional(),
    user_agent: z.string().max(1024).optional()
  }).optional(),
  opt_out: z.boolean().optional()
});

function validTimestamp(timestampMs: number) {
  const now = Date.now();
  return timestampMs >= now - 7 * 24 * 60 * 60 * 1000 && timestampMs <= now + 10 * 60 * 1000;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json: unknown = await request.json().catch(() => null);
  const parsed = conversionSchema.safeParse(json);
  if (!parsed.success || !validTimestamp(parsed.data.timestamp_ms)) {
    return NextResponse.json({ error: "Invalid conversion payload" }, { status: 400 });
  }

  try {
    await sendOpenAIAdsConversion({
      id: parsed.data.id,
      type: parsed.data.type,
      timestampMs: parsed.data.timestamp_ms,
      sourceUrl: parsed.data.source_url,
      oppref: parsed.data.oppref,
      emailSha256: parsed.data.user?.email_sha256,
      externalIdSha256: parsed.data.user?.external_id_sha256,
      ipAddress: parsed.data.user?.ip_address,
      userAgent: parsed.data.user?.user_agent,
      optOut: parsed.data.opt_out
    });

    return NextResponse.json(
      { accepted: true, id: parsed.data.id, type: parsed.data.type },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Conversion delivery unavailable" },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } });
}
