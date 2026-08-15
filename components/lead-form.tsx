"use client";

import { FormEvent, useState } from "react";

type State = "idle" | "submitting" | "success" | "error";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function LeadForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const consent = localStorage.getItem("sg_measurement_consent") === "granted";
    const email = String(data.get("email") ?? "");

    const payload = {
      name: data.get("name"),
      email,
      phone: data.get("phone"),
      company: data.get("company"),
      service: data.get("service"),
      message: data.get("message"),
      website: data.get("website"),
      measurementConsent: consent,
      sourceUrl: window.location.href
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result: { accepted?: boolean; leadId?: string; measured?: boolean; error?: string } =
        await response.json();

      if (!response.ok || !result.accepted || !result.leadId) {
        throw new Error(result.error || "Your inquiry could not be submitted.");
      }

      if (result.measured && window.oaiq) {
        try {
          window.oaiq("init", { user: { email_sha256: await sha256(email) } });
          window.oaiq(
            "measure",
            "lead_created",
            { type: "customer_action" },
            { event_id: result.leadId }
          );
        } catch {
          // Measurement cannot change the lead submission outcome.
        }
      }

      form.reset();
      setState("success");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Please try again.");
      setState("error");
    }
  }

  return (
    <form className="lead-form" onSubmit={submit}>
      <div className="grid-two">
        <label>
          Name
          <input name="name" required minLength={2} autoComplete="name" />
        </label>
        <label>
          Work email
          <input name="email" required type="email" autoComplete="email" />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" autoComplete="tel" />
        </label>
        <label>
          Company or firm
          <input name="company" autoComplete="organization" />
        </label>
      </div>
      <label>
        Area of need
        <select name="service" required defaultValue="">
          <option value="" disabled>Select a service</option>
          <option>Due Diligence</option>
          <option>Fraud Investigation</option>
          <option>Asset Tracing &amp; Recovery</option>
          <option>Litigation Intelligence</option>
          <option>Corporate Intelligence</option>
          <option>Digital Asset Investigation</option>
        </select>
      </label>
      <label>
        Confidential summary
        <textarea name="message" required minLength={20} rows={6} />
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="button" disabled={state === "submitting"} type="submit">
        {state === "submitting" ? "Submitting…" : "Request confidential assessment"}
      </button>
      <p className="form-note">Do not submit privileged documents through this form.</p>
      <div aria-live="polite">
        {state === "success" && (
          <p className="success">Your inquiry was delivered. Our team will respond confidentially.</p>
        )}
        {state === "error" && <p className="error">{error}</p>}
      </div>
    </form>
  );
}
