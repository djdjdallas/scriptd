import Link from "next/link";

export const metadata = {
  title: "About GenScript | AI YouTube Script Generator",
  description:
    "GenScript is an AI YouTube script generator founded in 2024 in Los Angeles. We use Voice DNA technology to help creators produce retention-optimized, compliance-checked scripts that match their unique voice.",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GenScript",
  url: "https://genscript.io",
  foundingDate: "2024",
  description:
    "AI YouTube script generator that matches your voice using Voice DNA technology. Retention-optimized, compliance-checked scripts trusted by 500+ creators.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+14242880215",
    contactType: "customer support",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Los Angeles",
    addressRegion: "CA",
    addressCountry: "US",
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <div className="min-h-screen bg-[#030303] text-white">
        {/* Nav */}
        <nav className="fixed top-0 w-full z-50 bg-[#030303]/80 backdrop-blur-xl border-b border-white/[0.04]">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
            <Link href="/" className="font-display text-xl text-white">
              GenScript
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              &larr; Back to Home
            </Link>
          </div>
        </nav>

        {/* Content */}
        <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
          <h1 className="font-display text-5xl md:text-6xl text-white mb-8">
            About GenScript
          </h1>

          <div className="space-y-8">
            {/* Founding Story */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
              <h2 className="font-display text-2xl text-white mb-4">
                Our Story
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                GenScript was founded in 2024 with a simple observation: YouTube
                creators were stuck between two bad options. Write every script
                by hand and burn out, or use generic AI tools that stripped away
                their voice and risked policy violations.
              </p>
              <p className="text-gray-400 leading-relaxed">
                We built GenScript to solve both problems. Our Voice DNA
                technology extracts what makes each creator unique — their
                catchphrases, pacing, humor, and transitions — then generates
                scripts that sound authentically like them. Every script is
                checked for YouTube compliance before it ever reaches a camera.
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                <h2 className="font-display text-2xl text-white mb-4">
                  Company Details
                </h2>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-600">Founded</dt>
                    <dd className="text-white">2024</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Location</dt>
                    <dd className="text-white">Los Angeles, CA</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Contact</dt>
                    <dd className="text-white">+1 (424) 288-0215</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Website</dt>
                    <dd>
                      <a
                        href="https://genscript.io"
                        className="text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        genscript.io
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                <h2 className="font-display text-2xl text-white mb-4">
                  By the Numbers
                </h2>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-600">Creators Served</dt>
                    <dd className="text-white">500+</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Scripts Generated</dt>
                    <dd className="text-white">2.5M+</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Avg Retention Rate</dt>
                    <dd className="text-white">68%</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Policy Strikes</dt>
                    <dd className="text-white">0</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Mission */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
              <h2 className="font-display text-2xl text-white mb-4">
                Our Mission
              </h2>
              <p className="text-gray-400 leading-relaxed">
                We believe every creator deserves tools that amplify their voice
                instead of replacing it. Our mission is to make high-quality,
                retention-optimized scriptwriting accessible to every YouTube
                creator — from first-time uploaders to channels with millions of
                subscribers — without compromising authenticity or compliance.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.04] py-8 text-center text-xs text-gray-700">
          &copy; {new Date().getFullYear()} GenScript. All rights reserved.
        </footer>
      </div>
    </>
  );
}
