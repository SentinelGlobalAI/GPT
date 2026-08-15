import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ConsentBanner } from "@/components/consent-banner";
import { OpenAIAdsPixel } from "@/components/openai-ads-pixel";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sentinelglobal.ai"),
  title: "Sentinel Global | Decision-Grade Forensic Intelligence",
  description:
    "Forensic intelligence, due diligence, fraud investigations, asset tracing and litigation support for companies, investors and counsel."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <OpenAIAdsPixel />
      </head>
      <body>
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
