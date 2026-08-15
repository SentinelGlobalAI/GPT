"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "sg_measurement_consent";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setVisible(localStorage.getItem(CONSENT_KEY) === null);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function choose(granted: boolean) {
    localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
    window.oaiq?.("consent", granted);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside className="consent" aria-label="Measurement preferences">
      <p>
        We use privacy-conscious measurement to understand whether our advertising generates
        legitimate inquiries. You can decline without affecting the site.
      </p>
      <div>
        <button className="button secondary" onClick={() => choose(false)} type="button">
          Decline
        </button>
        <button className="button" onClick={() => choose(true)} type="button">
          Allow measurement
        </button>
      </div>
    </aside>
  );
}
