// Tools Layout - Public layout for free tools

import ToolsNav from "@/components/tools/ToolsNav";

export const metadata = {
  title: "Free YouTube Tools | AI-Powered Creator Tools for YouTube Success",
  description:
    "Access 11 free YouTube creator tools: title generator, hook generator, transcript extractor, idea generator, hashtag generator, thumbnail ideas, and more. AI-powered tools to grow your YouTube channel faster.",
  keywords:
    "youtube tools, youtube title generator, hook generator, transcript extractor, video idea generator, hashtag generator, youtube creator tools, ai youtube tools, free youtube tools, faceless youtube, retention optimizer, pvss framework, voice matching ai",
  openGraph: {
    title: "Free YouTube Tools | 11 AI-Powered Creator Tools",
    description:
      "Grow your YouTube channel with free AI tools: title generator, hook generator, transcript extractor, and more. Used by 50,000+ creators worldwide.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free YouTube Tools | 11 AI-Powered Creator Tools",
    description:
      "Access 11 free YouTube creator tools to grow your channel faster. Title generator, hook generator, and more.",
  },
  alternates: {
    canonical: "https://genscript.io/tools",
  },
};

export default function ToolsLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Background Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]"
          style={{ transform: "translateZ(0)" }}
        />
        <div
          className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px]"
          style={{ transform: "translateZ(0)" }}
        />
      </div>

      {/* Navigation */}
      <ToolsNav />

      {/* Main Content */}
      <main className="pt-24">{children}</main>
    </div>
  );
}
