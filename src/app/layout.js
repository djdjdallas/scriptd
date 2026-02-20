import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  homepageMetadata,
  structuredData,
  faqStructuredData,
  organizationStructuredData,
  marketStatsStructuredData
} from "./metadata";

const inter = Inter({ subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display"
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata = homepageMetadata;

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0a',
};

export default function RootLayout({ children }) {
  const allStructuredData = [
    structuredData,
    faqStructuredData,
    organizationStructuredData,
    marketStatsStructuredData
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} ${instrumentSerif.variable} ${jetbrainsMono.variable} antialiased`}>
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(allStructuredData)
          }}
        />
        {children}
        <SpeedInsights />
        <Toaster
          position="bottom-right"
          expand={false}
          richColors
          duration={4000}
        />
      </body>
    </html>
  );
}
