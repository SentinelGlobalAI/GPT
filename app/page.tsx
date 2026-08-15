import { LeadForm } from "@/components/lead-form";

const services = [
  ["Due Diligence", "Verify counterparties, ownership, litigation, reputation and hidden risk before capital moves."],
  ["Fraud Investigation", "Reconstruct conduct, money movement and relationships into an evidence-supported narrative."],
  ["Asset Tracing & Recovery", "Identify digital and traditional assets, control points and practical recovery paths."],
  ["Litigation Intelligence", "Turn fragmented records into timelines, entity maps, issue matrices and decision-grade support."],
  ["Corporate Intelligence", "Assess internal threats, adverse actors, strategic exposure and complex business relationships."],
  ["Digital Asset Investigation", "Trace blockchain activity, attribution signals, exchange touchpoints and off-ramp exposure."]
];

export default function Home() {
  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#top" aria-label="Sentinel Global home">
          <span className="mark">S</span>
          <span>SENTINEL GLOBAL</span>
        </a>
        <a className="nav-link" href="#contact">Request assessment</a>
      </nav>

      <section className="hero" id="top">
        <div className="eyebrow">Human-led. AI-powered. Evidence-focused.</div>
        <h1>Decision-grade forensic intelligence when the stakes are highest.</h1>
        <p>
          Sentinel Global helps companies, investors and attorneys uncover hidden risk, investigate
          misconduct and pursue recoverable value through documented intelligence workflows.
        </p>
        <div className="hero-actions">
          <a className="button" href="#contact">Request a confidential assessment</a>
          <a className="text-link" href="#services">Explore capabilities</a>
        </div>
      </section>

      <section className="section" id="services">
        <div className="section-heading">
          <div className="eyebrow">Core capabilities</div>
          <h2>Intelligence built for action, not observation.</h2>
        </div>
        <div className="service-grid">
          {services.map(([title, description], index) => (
            <article className="service-card" key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="proof">
        <div><strong>24–72 hr</strong><span>typical intelligence cycle</span></div>
        <div><strong>Human-led</strong><span>analyst review and judgment</span></div>
        <div><strong>Traceable</strong><span>sources, methods and confidence</span></div>
      </section>

      <section className="contact" id="contact">
        <div className="contact-copy">
          <div className="eyebrow">Confidential intake</div>
          <h2>Tell us what must be known, proven or recovered.</h2>
          <p>
            Share the core issue and decision deadline. We will assess fit, urgency and the most
            efficient investigative path.
          </p>
        </div>
        <LeadForm />
      </section>

      <footer>
        <span>© {new Date().getFullYear()} Sentinel Global Technologies, Inc.</span>
        <span>Forensic Intelligence &amp; Verification</span>
      </footer>
    </main>
  );
}
