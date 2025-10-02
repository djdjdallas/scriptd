import React from 'react';
import TableOfContents from '@/components/legal/TableOfContents';
import LegalSection from '@/components/legal/LegalSection';
import LastUpdated from '@/components/legal/LastUpdated';
import BackToTop from '@/components/legal/BackToTop';
import Link from 'next/link';
import Script from 'next/script';

export const metadata = {
  title: 'Privacy Policy | GenScript - AI YouTube Script Generator',
  description: 'Learn how GenScript collects, uses, and protects your personal information. Read our comprehensive privacy policy for our AI-powered YouTube script generation platform.',
  openGraph: {
    title: 'Privacy Policy | GenScript',
    description: 'GenScript Privacy Policy - How we protect your data',
    url: 'https://genscript.io/privacy',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | GenScript',
    description: 'GenScript Privacy Policy - How we protect your data',
  },
  alternates: {
    canonical: 'https://genscript.io/privacy',
  },
};

const sections = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'information-collect', title: '2. Information We Collect' },
  { id: 'how-we-use', title: '3. How We Use Your Information' },
  { id: 'how-we-share', title: '4. How We Share Your Information' },
  { id: 'data-security', title: '5. Data Security' },
  { id: 'your-rights', title: '6. Your Data Rights' },
  { id: 'data-retention', title: '7. Data Retention' },
  { id: 'international-transfers', title: '8. International Data Transfers' },
  { id: 'children-privacy', title: '9. Children\'s Privacy' },
  { id: 'california-rights', title: '10. California Privacy Rights (CCPA)' },
  { id: 'cookie-policy', title: '11. Cookie Policy' },
  { id: 'third-party-links', title: '12. Third-Party Links' },
  { id: 'policy-changes', title: '13. Changes to This Policy' },
  { id: 'contact', title: '14. Contact Information' },
  { id: 'regional-terms', title: '15. Supplemental Terms for Specific Regions' },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Privacy Policy',
  description: 'GenScript Privacy Policy - How we collect, use, and protect your information',
  publisher: {
    '@type': 'Organization',
    name: 'GenScript, Inc.',
    url: 'https://genscript.io',
  },
  dateModified: '2025-01-01',
};

export default function PrivacyPolicy() {
  return (
    <>
      <Script
        id="privacy-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container max-w-7xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="mb-10">
            <Link
              href="/"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mb-6 transition-colors"
            >
              ← Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Privacy Policy
            </h1>
            <LastUpdated date="January 2025" />
          </div>

          <div className="flex gap-8 lg:gap-12">
            {/* Desktop TOC - Sticky Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-20">
                <TableOfContents sections={sections} />
              </div>
            </aside>

            {/* Mobile TOC */}
            <div className="lg:hidden w-full">
              <TableOfContents sections={sections} />
            </div>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl">
              <div className="prose prose-gray dark:prose-invert max-w-none">

                <LegalSection id="introduction" title="1. Introduction">
                  <p>
                    Welcome to GenScript! This Privacy Policy explains how GenScript, Inc. ("GenScript," "we," "us," or "our")
                    collects, uses, discloses, and protects your personal information when you use our AI-powered YouTube script
                    generation platform and related services (the "Service").
                  </p>
                  <p>
                    We are committed to protecting your privacy and being transparent about our data practices. By using the
                    Service, you agree to the collection and use of information in accordance with this Privacy Policy.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Quick Summary:</p>
                    <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1 list-disc list-inside">
                      <li>We collect information you provide and usage data</li>
                      <li>We use data to provide and improve our Service</li>
                      <li>We don't sell your personal information</li>
                      <li>You have rights to access, correct, and delete your data</li>
                      <li>We use industry-standard security measures</li>
                    </ul>
                  </div>
                </LegalSection>

                <LegalSection id="information-collect" title="2. Information We Collect">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">2.1 Personal Information You Provide</h4>
                  <p>We collect information you directly provide to us, including:</p>

                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Account Information:</h5>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Name and email address</li>
                    <li>Username and password</li>
                    <li>Profile picture (optional)</li>
                    <li>Company name and role (for business accounts)</li>
                  </ul>

                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Payment Information:</h5>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Billing address</li>
                    <li>Payment method details (processed securely by Stripe)</li>
                    <li>Transaction history</li>
                  </ul>

                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Content and Communications:</h5>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Script inputs, prompts, and generated content</li>
                    <li>Channel information and analytics you choose to connect</li>
                    <li>Voice profile data and preferences</li>
                    <li>Support messages and feedback</li>
                    <li>Survey responses</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-6">2.2 Information Automatically Collected</h4>
                  <p>When you use the Service, we automatically collect:</p>

                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Usage Information:</h5>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Features you use and how you interact with the Service</li>
                    <li>Scripts generated, credits used, and export activity</li>
                    <li>Search queries and research activity</li>
                    <li>Time, frequency, and duration of your activities</li>
                  </ul>

                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Device and Technical Information:</h5>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>IP address and approximate location</li>
                    <li>Device type, operating system, and browser</li>
                    <li>Language preferences and time zone</li>
                    <li>Referring/exit pages and URLs</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>

                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Performance and Error Data:</h5>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Error reports and crash data</li>
                    <li>Performance metrics and diagnostics</li>
                    <li>API response times and system health</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-6">2.3 Information from Third Parties</h4>
                  <p>We may receive information from:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>YouTube:</strong> Channel data, analytics, and video information when you connect your account</li>
                    <li><strong>Authentication Providers:</strong> Profile information from Google, GitHub, or other OAuth providers</li>
                    <li><strong>Payment Processors:</strong> Transaction verification from Stripe</li>
                    <li><strong>Analytics Providers:</strong> Aggregated usage statistics and performance metrics</li>
                  </ul>
                </LegalSection>

                <LegalSection id="how-we-use" title="3. How We Use Your Information">
                  <p>We use the collected information for the following purposes:</p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">3.1 Provide and Maintain the Service</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Generate AI-powered scripts based on your inputs</li>
                    <li>Store and manage your content and preferences</li>
                    <li>Process payments and maintain billing records</li>
                    <li>Provide customer support and respond to inquiries</li>
                    <li>Enable team collaboration features</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">3.2 Improve and Optimize</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Analyze usage patterns to improve features and performance</li>
                    <li>Train and refine our AI models using aggregated, anonymized data</li>
                    <li>Develop new features and services</li>
                    <li>Conduct research and analytics</li>
                    <li>Test and optimize user experience</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">3.3 Communicate with You</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Send transactional emails (receipts, confirmations, notifications)</li>
                    <li>Provide product updates and feature announcements</li>
                    <li>Send marketing communications (with your consent)</li>
                    <li>Request feedback and conduct surveys</li>
                    <li>Respond to your comments and questions</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">3.4 Security and Compliance</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Detect and prevent fraud, abuse, and security incidents</li>
                    <li>Enforce our Terms of Service and Acceptable Use Policy</li>
                    <li>Comply with legal obligations and regulatory requirements</li>
                    <li>Protect the rights, property, and safety of GenScript and users</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">3.5 Personalization</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Customize content and recommendations</li>
                    <li>Remember your preferences and settings</li>
                    <li>Provide relevant tips and guidance</li>
                    <li>Optimize quality tier and script length suggestions</li>
                  </ul>
                </LegalSection>

                <LegalSection id="how-we-share" title="4. How We Share Your Information" important={true}>
                  <p className="font-semibold">We do not sell your personal information. We may share your information in the following circumstances:</p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">4.1 Service Providers</h4>
                  <p>We share data with trusted third-party service providers who help us operate the Service:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>AI Model Providers:</strong> Anthropic, OpenAI (for script generation)</li>
                    <li><strong>Cloud Infrastructure:</strong> AWS, Vercel (for hosting and storage)</li>
                    <li><strong>Payment Processing:</strong> Stripe (for billing and subscriptions)</li>
                    <li><strong>Analytics:</strong> Vercel Analytics, PostHog (for usage insights)</li>
                    <li><strong>Email Services:</strong> Resend (for transactional emails)</li>
                    <li><strong>Customer Support:</strong> Support ticketing systems</li>
                  </ul>
                  <p className="mt-4">
                    These providers are contractually obligated to protect your data and use it only for the purposes we specify.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">4.2 Business Transfers</h4>
                  <p>
                    If GenScript is involved in a merger, acquisition, asset sale, or bankruptcy, your information may be
                    transferred as part of that transaction. We will notify you before your information becomes subject to
                    a different privacy policy.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">4.3 Legal Requirements</h4>
                  <p>We may disclose your information if required to do so by law or in response to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Valid legal processes (subpoenas, court orders, warrants)</li>
                    <li>Government requests or investigations</li>
                    <li>Requests to protect rights, property, or safety</li>
                    <li>Enforce our Terms of Service</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">4.4 With Your Consent</h4>
                  <p>
                    We may share your information with third parties when you explicitly consent, such as:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Connecting your YouTube channel</li>
                    <li>Sharing generated scripts publicly (if you choose)</li>
                    <li>Participating in case studies or testimonials</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">4.5 Aggregated Data</h4>
                  <p>
                    We may share aggregated, anonymized data that does not identify you personally for industry analysis,
                    research, marketing, or other business purposes.
                  </p>
                </LegalSection>

                <LegalSection id="data-security" title="5. Data Security">
                  <p>
                    We implement appropriate technical and organizational security measures to protect your personal information
                    from unauthorized access, disclosure, alteration, or destruction.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">5.1 Security Measures</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Encryption:</strong> Data encrypted in transit (TLS/SSL) and at rest (AES-256)</li>
                    <li><strong>Authentication:</strong> Password hashing with bcrypt, multi-factor authentication support</li>
                    <li><strong>Access Controls:</strong> Role-based access, principle of least privilege</li>
                    <li><strong>Infrastructure:</strong> Secure cloud hosting with regular security audits</li>
                    <li><strong>Monitoring:</strong> 24/7 system monitoring and intrusion detection</li>
                    <li><strong>Backups:</strong> Regular encrypted backups with disaster recovery procedures</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">5.2 Your Responsibility</h4>
                  <p>
                    While we implement strong security measures, you are responsible for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Keeping your password secure and confidential</li>
                    <li>Enabling two-factor authentication</li>
                    <li>Not sharing your account credentials</li>
                    <li>Reporting any suspicious activity immediately</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">5.3 Data Breach Notification</h4>
                  <p>
                    In the event of a data breach that affects your personal information, we will notify you and relevant
                    authorities as required by applicable law, typically within 72 hours of discovery.
                  </p>
                </LegalSection>

                <LegalSection id="your-rights" title="6. Your Data Rights">
                  <p>
                    Depending on your location, you may have the following rights regarding your personal information:
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">6.1 Access and Portability</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Request a copy of your personal data</li>
                    <li>Export your scripts and content in portable formats</li>
                    <li>Receive information about how we process your data</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">6.2 Correction and Update</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Update your account information at any time</li>
                    <li>Correct inaccurate or incomplete data</li>
                    <li>Request correction of data we hold about you</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">6.3 Deletion</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Delete your account and associated data</li>
                    <li>Request deletion of specific information</li>
                    <li>Note: We may retain certain data as required by law or for legitimate business purposes</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">6.4 Restriction and Objection</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Restrict how we process your data</li>
                    <li>Object to processing for direct marketing</li>
                    <li>Withdraw consent for optional data uses</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">6.5 How to Exercise Your Rights</h4>
                  <p>
                    To exercise any of these rights, please contact us at{' '}
                    <a href="mailto:privacy@genscript.io" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 underline">
                      privacy@genscript.io
                    </a>{' '}
                    or through your account settings. We will respond within 30 days of receiving your request.
                  </p>
                  <p className="mt-4">
                    You also have the right to lodge a complaint with a data protection authority in your jurisdiction
                    if you believe we have violated your privacy rights.
                  </p>
                </LegalSection>

                <LegalSection id="data-retention" title="7. Data Retention">
                  <p>
                    We retain your personal information for as long as necessary to provide the Service and fulfill
                    the purposes outlined in this Privacy Policy.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">7.1 Retention Periods</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Account Data:</strong> While your account is active and for 30 days after deletion</li>
                    <li><strong>Scripts and Content:</strong> While your account is active and for 30 days after deletion</li>
                    <li><strong>Billing Records:</strong> 7 years for tax and accounting purposes</li>
                    <li><strong>Support Communications:</strong> 3 years</li>
                    <li><strong>Analytics Data:</strong> Aggregated data retained indefinitely</li>
                    <li><strong>Backup Data:</strong> Up to 90 days in encrypted backups</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">7.2 Deletion After Retention</h4>
                  <p>
                    After the retention period expires, we securely delete or anonymize your data. Some information may
                    be retained longer if required by law or for legitimate business interests (e.g., fraud prevention).
                  </p>
                </LegalSection>

                <LegalSection id="international-transfers" title="8. International Data Transfers">
                  <p>
                    GenScript is based in the United States. If you access the Service from outside the United States,
                    your information may be transferred to, stored, and processed in the United States and other countries
                    where our service providers operate.
                  </p>
                  <p className="mt-4">
                    We ensure appropriate safeguards are in place for international data transfers, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                    <li>Adequacy decisions for transfers to certain countries</li>
                    <li>Privacy Shield certification (where applicable)</li>
                    <li>Binding Corporate Rules for service providers</li>
                  </ul>
                </LegalSection>

                <LegalSection id="children-privacy" title="9. Children's Privacy" important={true}>
                  <p>
                    The Service is not intended for children under 18 years of age. We do not knowingly collect personal
                    information from children under 18.
                  </p>
                  <p className="mt-4">
                    If you are a parent or guardian and believe your child has provided us with personal information,
                    please contact us at{' '}
                    <a href="mailto:privacy@genscript.io" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 underline">
                      privacy@genscript.io
                    </a>.
                    We will delete such information from our systems.
                  </p>
                </LegalSection>

                <LegalSection id="california-rights" title="10. California Privacy Rights (CCPA)">
                  <p>
                    If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">10.1 Right to Know</h4>
                  <p>You have the right to request:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Categories of personal information we collect</li>
                    <li>Sources from which we collect information</li>
                    <li>Business purposes for collecting information</li>
                    <li>Categories of third parties we share information with</li>
                    <li>Specific pieces of personal information we hold about you</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">10.2 Right to Delete</h4>
                  <p>
                    You can request deletion of your personal information, subject to certain exceptions (e.g., legal obligations,
                    fraud prevention).
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">10.3 Right to Opt-Out of Sale</h4>
                  <p>
                    We do not sell your personal information. If our practices change, we will update this policy and provide
                    an opt-out mechanism.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">10.4 Right to Non-Discrimination</h4>
                  <p>
                    We will not discriminate against you for exercising your CCPA rights.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">10.5 "Shine the Light" Law</h4>
                  <p>
                    California residents can request information about personal information disclosed to third parties for
                    direct marketing purposes. Since we don't share for this purpose, this doesn't apply.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">10.6 How to Exercise CCPA Rights</h4>
                  <p>
                    Email{' '}
                    <a href="mailto:privacy@genscript.io" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 underline">
                      privacy@genscript.io
                    </a>{' '}
                    with "CCPA Request" in the subject line. We may verify your identity before processing requests.
                  </p>
                </LegalSection>

                <LegalSection id="cookie-policy" title="11. Cookie Policy">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">11.1 What Are Cookies</h4>
                  <p>
                    Cookies are small text files stored on your device when you visit our website. We use cookies and
                    similar technologies (web beacons, pixels, local storage) to improve your experience.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">11.2 Types of Cookies We Use</h4>

                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Essential Cookies (Required)</h5>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Authentication and session management</li>
                    <li>Security and fraud prevention</li>
                    <li>Load balancing and performance</li>
                  </ul>

                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Functional Cookies (Optional)</h5>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Remember your preferences and settings</li>
                    <li>Personalize content and features</li>
                    <li>Enable social media features</li>
                  </ul>

                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Analytics Cookies (Optional)</h5>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Understand how you use the Service</li>
                    <li>Measure feature effectiveness</li>
                    <li>Improve user experience</li>
                  </ul>

                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Marketing Cookies (Optional)</h5>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Track advertising effectiveness</li>
                    <li>Deliver relevant ads</li>
                    <li>Measure campaign performance</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">11.3 Managing Cookies</h4>
                  <p>
                    You can control cookies through your browser settings or our cookie preference center. Note that
                    disabling certain cookies may limit functionality.
                  </p>
                </LegalSection>

                <LegalSection id="third-party-links" title="12. Third-Party Links">
                  <p>
                    The Service may contain links to third-party websites, applications, or services not operated by GenScript.
                    We are not responsible for the privacy practices of these third parties.
                  </p>
                  <p className="mt-4">
                    We encourage you to review the privacy policies of any third-party services you visit. This Privacy Policy
                    applies only to information collected by GenScript.
                  </p>
                </LegalSection>

                <LegalSection id="policy-changes" title="13. Changes to This Policy">
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes in our practices, technology,
                    legal requirements, or other factors.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">13.1 Notification of Changes</h4>
                  <p>We will notify you of material changes by:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Updating the "Last Updated" date at the top of this policy</li>
                    <li>Sending an email to your registered email address</li>
                    <li>Displaying a prominent notice on the Service</li>
                    <li>Requiring you to accept the updated policy</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">13.2 Your Acceptance</h4>
                  <p>
                    Continued use of the Service after changes take effect constitutes acceptance of the updated Privacy Policy.
                    If you do not agree to changes, you should discontinue use and delete your account.
                  </p>
                </LegalSection>

                <LegalSection id="contact" title="14. Contact Information">
                  <p>
                    If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
                    please contact us:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mt-4">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-3">GenScript, Inc.</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Privacy Officer</strong>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Email: <a href="mailto:privacy@genscript.io" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 underline">privacy@genscript.io</a>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      General: <a href="mailto:legal@genscript.io" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 underline">legal@genscript.io</a>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Support: <a href="mailto:support@genscript.io" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 underline">support@genscript.io</a>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Website: <a href="https://genscript.io" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 underline">genscript.io</a>
                    </p>
                  </div>
                  <p className="mt-4">
                    We will respond to your request within 30 days. For urgent privacy concerns, please indicate "Urgent"
                    in your subject line.
                  </p>
                </LegalSection>

                <LegalSection id="regional-terms" title="15. Supplemental Terms for Specific Regions">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">15.1 European Economic Area (EEA) and UK</h4>
                  <p>
                    If you are located in the EEA or UK, we process your data in accordance with the General Data Protection
                    Regulation (GDPR) and UK GDPR.
                  </p>

                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Legal Basis for Processing:</h5>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Contract Performance:</strong> To provide the Service per our Terms</li>
                    <li><strong>Legitimate Interests:</strong> To improve and secure the Service</li>
                    <li><strong>Consent:</strong> For marketing communications and optional features</li>
                    <li><strong>Legal Obligations:</strong> To comply with laws and regulations</li>
                  </ul>

                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Your GDPR Rights:</h5>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Right to access your personal data</li>
                    <li>Right to rectification of inaccurate data</li>
                    <li>Right to erasure ("right to be forgotten")</li>
                    <li>Right to restrict processing</li>
                    <li>Right to data portability</li>
                    <li>Right to object to processing</li>
                    <li>Right to withdraw consent</li>
                    <li>Right to lodge a complaint with a supervisory authority</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-6">15.2 Canada</h4>
                  <p>
                    We comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable
                    provincial privacy laws. Canadian residents can contact our Privacy Officer for data access requests.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">15.3 Australia</h4>
                  <p>
                    We comply with the Australian Privacy Principles (APPs) under the Privacy Act 1988. Australian residents
                    can contact the Office of the Australian Information Commissioner (OAIC) for complaints.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">15.4 Brazil</h4>
                  <p>
                    We comply with Lei Geral de Proteção de Dados (LGPD). Brazilian residents have rights to access, correct,
                    delete, and port data, as well as request information about data sharing.
                  </p>
                </LegalSection>

                {/* Data Processing Summary Table */}
                <div className="mt-8 overflow-x-auto">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Data Processing Summary</h3>
                  <table className="min-w-full border border-gray-300 dark:border-gray-600 text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">Data Category</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">Purpose</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">Legal Basis</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">Retention</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-400">
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Account Information</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Service provision, authentication</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Contract</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Active + 30 days</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Payment Data</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Billing, tax compliance</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Contract, Legal</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">7 years</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Generated Scripts</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Service delivery, storage</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Contract</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Active + 30 days</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Usage Analytics</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Service improvement</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Legitimate Interest</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Indefinite (anonymized)</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Marketing Data</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Communications</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Consent</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Until withdrawal</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Related Links */}
                <div className="mt-12 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">Related Documents</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/terms" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline">
                        Terms of Service →
                      </Link>
                    </li>
                    <li>
                      <Link href="/" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline">
                        Back to GenScript →
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Effective Date */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                  <p>This Privacy Policy was last updated on January 1, 2025.</p>
                  <p className="mt-2">© 2025 GenScript, Inc. All rights reserved.</p>
                </div>
              </div>
            </main>
          </div>
        </div>

        <BackToTop />
      </div>
    </>
  );
}
