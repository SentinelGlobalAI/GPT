import "server-only";

type Lead = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service: string;
  message: string;
};

export async function deliverLead(lead: Lead) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  const from = process.env.LEAD_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    throw new Error("Lead delivery is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: lead.email,
      subject: `Confidential inquiry: ${lead.service}`,
      text: [
        `Name: ${lead.name}`,
        `Email: ${lead.email}`,
        `Phone: ${lead.phone || "Not provided"}`,
        `Company: ${lead.company || "Not provided"}`,
        `Service: ${lead.service}`,
        "",
        lead.message
      ].join("\n")
    }),
    signal: AbortSignal.timeout(5000)
  });

  if (!response.ok) {
    throw new Error("Lead delivery failed");
  }
}
