const controls = [
  ["Server-only secrets", "CAPI and ingest credentials never enter the browser bundle."],
  ["Restricted events", "Only lead_created and appointment_scheduled are accepted."],
  ["Trusted origin", "source_url must match the configured Sentinel Global website origin."],
  ["Shared deduplication", "The website Pixel and gateway CAPI use the same conversion ID."],
  ["Opaque attribution", "__oppref is forwarded unchanged and never decoded or logged."],
  ["Strict validation", "Timestamps, hashes, identifiers and payload sizes are bounded."]
];

export default function Home() {
  const configured = Boolean(
    process.env.OPENAI_ADS_PIXEL_ID &&
    process.env.OPENAI_ADS_CONVERSIONS_API_KEY &&
    process.env.OPENAI_ADS_SITE_ORIGIN &&
    process.env.SENTINEL_ADS_INGEST_KEY
  );

  return (
    <main className="gateway-shell">
      <header>
        <div className="identity"><span>SG</span><div><strong>SENTINEL GLOBAL</strong><small>ADS MEASUREMENT GATEWAY</small></div></div>
        <a href="/api/health">System health</a>
      </header>
      <section className="gateway-hero">
        <p className="eyebrow">Independent measurement infrastructure</p>
        <h1>One secure conversion layer.<br /><span>Any Sentinel web property.</span></h1>
        <p>A standalone server boundary for OpenAI Ads conversions, isolated from the public website and designed for controlled integration by the marketing and development teams.</p>
        <div className="status"><i /> Deployment active <b>{configured ? "Gateway configured" : "Configuration required"}</b></div>
      </section>
      <section className="flow">
        <div><span>01</span><strong>Website success</strong><small>Lead or booking is confirmed</small></div><b>→</b>
        <div><span>02</span><strong>Shared event ID</strong><small>Pixel and server use one ID</small></div><b>→</b>
        <div><span>03</span><strong>Secure gateway</strong><small>Request is authenticated and validated</small></div><b>→</b>
        <div><span>04</span><strong>OpenAI Ads</strong><small>Conversion is delivered and deduplicated</small></div>
      </section>
      <section className="controls">
        <div className="section-title"><p className="eyebrow">Security controls</p><h2>Designed to fail closed.</h2></div>
        <div className="control-grid">{controls.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>
      <footer><span>Sentinel Global Technologies, Inc.</span><span>No customer data is displayed or stored by this interface.</span></footer>
    </main>
  );
}
