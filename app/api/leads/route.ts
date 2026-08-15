import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { deliverLead } from "@/lib/lead-delivery";
import { sanitizeSourceUrl, sendOpenAIAdsConversion } from "@/lib/openai-ads";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  service: z.enum([
    "Due Diligence",
    "Fraud Investigation",
    "Asset Tracing & Recovery",
    "Litigation Intelligence",
    "Corporate Intelligence",
    "Digital Asset Investigation"
  ]),
  message: z.string().trim().min(20).max(5000),
  sourceUrl: z.string().max(2048).optional(),
  measurementConsent: z.boolean().default(false),
  website: z.string().max(0).optional()
});

function clientIp(request: NextRequest) {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    undefined
  );
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success || parsed.data.website) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  const { sourceUrl: browserSourceUrl, measurementConsent } = parsed.data;
  const lead = {
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    company: parsed.data.company,
    service: parsed.data.service,
    message: parsed.data.message
  };

  try {
    await deliverLead(lead);
  } catch {
    return NextResponse.json(
      { error: "We could not deliver your inquiry. Please try again." },
      { status: 503 }
    );
  }

  const leadId = crypto.randomUUID();

  if (measurementConsent) {
    const requestOrigin = request.nextUrl.origin;
    const oppref = request.cookies.get("__oppref")?.value;
    const email = lead.email;
    const ipAddress = clientIp(request);
    const userAgent = request.headers.get("user-agent") ?? undefined;

    after(async () => {
      try {
        const sourceUrl = sanitizeSourceUrl(browserSourceUrl, requestOrigin, "/contact");
        await sendOpenAIAdsConversion({
          eventId: leadId,
          type: "lead_created",
          sourceUrl,
          oppref,
          email,
          ipAddress,
          userAgent
        });
      } catch {
        // Event construction and dispatch are isolated from the accepted lead response.
      }
    });
  }

  return NextResponse.json({ accepted: true, leadId, measured: measurementConsent });
}
