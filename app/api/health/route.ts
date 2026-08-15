import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      service: "sentinel-openai-ads-gateway",
      status: "ok",
      configured: Boolean(
        process.env.OPENAI_ADS_PIXEL_ID &&
        process.env.OPENAI_ADS_CONVERSIONS_API_KEY &&
        process.env.OPENAI_ADS_SITE_ORIGIN &&
        process.env.SENTINEL_ADS_INGEST_KEY
      )
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
