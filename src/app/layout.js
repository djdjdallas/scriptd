import { Inter } from "next/font/google";
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

export const metadata = homepageMetadata;

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
      <body className={`${inter.className} antialiased`}>
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(allStructuredData)
          }}
        />
        {children}
        <Toaster
          position="bottom-right"
          expand={false}
          richColors
          duration={4000}
        />
        <SpeedInsights />
      </body>
    </html>
  );
}
