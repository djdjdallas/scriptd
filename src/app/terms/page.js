import React from 'react';
import TableOfContents from '@/components/legal/TableOfContents';
import LegalSection from '@/components/legal/LegalSection';
import LastUpdated from '@/components/legal/LastUpdated';
import BackToTop from '@/components/legal/BackToTop';
import Link from 'next/link';
import Script from 'next/script';

export const metadata = {
  title: 'Terms of Service | GenScript - AI YouTube Script Generator',
  description: 'Read GenScript\'s Terms of Service. Learn about our policies for using our AI-powered YouTube script generation platform.',
  openGraph: {
    title: 'Terms of Service | GenScript',
    description: 'GenScript Terms of Service and usage policies',
    url: 'https://genscript.io/terms',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | GenScript',
    description: 'GenScript Terms of Service and usage policies',
  },
  alternates: {
    canonical: 'https://genscript.io/terms',
  },
};

const sections = [
  { id: 'agreement', title: '1. Agreement to Terms' },
  { id: 'service', title: '2. Description of Service' },
  { id: 'account', title: '3. Account Registration and Security' },
  { id: 'acceptable-use', title: '4. Acceptable Use Policy' },
  { id: 'intellectual-property', title: '5. Intellectual Property Rights' },
  { id: 'payment', title: '6. Payment Terms' },
  { id: 'availability', title: '7. Service Availability and Modifications' },
  { id: 'privacy', title: '8. Privacy and Data Protection' },
  { id: 'third-party', title: '9. Third-Party Services' },
  { id: 'disclaimers', title: '10. Disclaimers and Limitations of Liability' },
  { id: 'indemnification', title: '11. Indemnification' },
  { id: 'termination', title: '12. Termination' },
  { id: 'dispute-resolution', title: '13. Dispute Resolution' },
  { id: 'general', title: '14. General Provisions' },
  { id: 'business-users', title: '15. Specific Terms for Business Users' },
  { id: 'export-controls', title: '16. Export Controls and Sanctions' },
  { id: 'dmca', title: '17. DMCA Policy' },
  { id: 'beta', title: '18. Beta Features' },
  { id: 'contact', title: '19. Contact Information' },
  { id: 'modifications', title: '20. Modifications to Terms' },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Terms of Service',
  description: 'GenScript Terms of Service and usage policies',
  publisher: {
    '@type': 'Organization',
    name: 'GenScript, Inc.',
    url: 'https://genscript.io',
  },
  dateModified: '2025-01-01',
};

export default function TermsOfService() {
  return (
    <>
      <Script
        id="terms-structured-data"
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
              Terms of Service
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

                <LegalSection id="agreement" title="1. Agreement to Terms">
                  <p>
                    Welcome to GenScript! These Terms of Service ("Terms") govern your access to and use of GenScript's
                    AI-powered YouTube script generation platform, website, and services (collectively, the "Service").
                    By accessing or using our Service, you agree to be bound by these Terms.
                  </p>
                  <p>
                    If you do not agree to these Terms, you may not access or use the Service. If you are using the
                    Service on behalf of an organization, you represent and warrant that you have the authority to bind
                    that organization to these Terms.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Important:</p>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      Please read these Terms carefully. They contain important information about your legal rights,
                      including mandatory arbitration and class action waiver provisions in Section 13.
                    </p>
                  </div>
                </LegalSection>

                <LegalSection id="service" title="2. Description of Service">
                  <p>
                    GenScript provides an AI-powered platform that helps content creators generate high-quality YouTube
                    scripts. Our Service includes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>AI-powered script generation using advanced language models</li>
                    <li>Multiple quality tiers (Fast, Professional, Hollywood Studio)</li>
                    <li>Research and fact-checking capabilities</li>
                    <li>Channel analytics and performance insights</li>
                    <li>Voice profile customization</li>
                    <li>Team collaboration features</li>
                    <li>Export capabilities in various formats</li>
                    <li>Integration with YouTube and other third-party services</li>
                  </ul>
                  <p>
                    We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time,
                    with or without notice, subject to the terms of your subscription plan.
                  </p>
                </LegalSection>

                <LegalSection id="account" title="3. Account Registration and Security">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">3.1 Account Creation</h4>
                  <p>
                    To use certain features of the Service, you must create an account. You agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide accurate, current, and complete information during registration</li>
                    <li>Maintain and promptly update your account information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Notify us immediately of any unauthorized access or security breach</li>
                    <li>Accept responsibility for all activities that occur under your account</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">3.2 Eligibility</h4>
                  <p>
                    You must be at least 18 years old or the age of majority in your jurisdiction to use the Service.
                    By using the Service, you represent and warrant that you meet these eligibility requirements.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">3.3 Account Security</h4>
                  <p>
                    You are solely responsible for maintaining the confidentiality of your account and password.
                    GenScript will not be liable for any loss or damage arising from your failure to comply with
                    this security obligation.
                  </p>
                </LegalSection>

                <LegalSection id="acceptable-use" title="4. Acceptable Use Policy" important={true}>
                  <p className="font-semibold">You agree NOT to use the Service to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Generate content that violates any applicable laws or regulations</li>
                    <li>Create misleading, deceptive, or fraudulent content</li>
                    <li>Produce content that infringes on intellectual property rights</li>
                    <li>Generate hate speech, harassment, or discriminatory content</li>
                    <li>Create content promoting violence, illegal activities, or self-harm</li>
                    <li>Generate spam, malware, or phishing content</li>
                    <li>Impersonate any person or entity</li>
                    <li>Attempt to reverse engineer, decompile, or extract our AI models</li>
                    <li>Use automated systems to access the Service without authorization</li>
                    <li>Interfere with or disrupt the Service or servers</li>
                    <li>Bypass any measures we use to prevent or restrict access to the Service</li>
                    <li>Resell or redistribute the Service without authorization</li>
                  </ul>
                  <p className="mt-4">
                    Violation of this Acceptable Use Policy may result in immediate termination of your account
                    and access to the Service, without refund.
                  </p>
                </LegalSection>

                <LegalSection id="intellectual-property" title="5. Intellectual Property Rights">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">5.1 GenScript's Rights</h4>
                  <p>
                    The Service, including its original content, features, and functionality, is owned by GenScript, Inc.
                    and is protected by United States and international copyright, trademark, patent, trade secret, and
                    other intellectual property laws.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">5.2 Your Content Rights</h4>
                  <p>
                    Subject to your compliance with these Terms and payment of applicable fees, you retain all rights
                    to the scripts and content you generate using the Service ("Your Content"). GenScript grants you
                    a worldwide, non-exclusive license to use, reproduce, distribute, and create derivative works from
                    Your Content.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">5.3 License to GenScript</h4>
                  <p>
                    By using the Service, you grant GenScript a limited, worldwide, non-exclusive, royalty-free license to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Store and process your inputs and generated content to provide the Service</li>
                    <li>Use aggregated, anonymized data to improve our AI models and Service</li>
                    <li>Display Your Content as examples in our marketing materials (with your explicit consent)</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">5.4 Trademarks</h4>
                  <p>
                    "GenScript" and our logo are trademarks of GenScript, Inc. You may not use our trademarks without
                    our prior written permission.
                  </p>
                </LegalSection>

                <LegalSection id="payment" title="6. Payment Terms">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">6.1 Subscription Plans</h4>
                  <p>GenScript offers the following subscription tiers:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Free Trial:</strong> $0/month - 50 credits, Fast generation only</li>
                    <li><strong>Creator:</strong> $39/month - 300 credits, Fast & Professional quality</li>
                    <li><strong>Professional:</strong> $79/month - 800 credits, All quality tiers</li>
                    <li><strong>Agency:</strong> $199/month - 2,000 credits, All tiers with premium features</li>
                  </ul>
                  <p className="mt-4">
                    Annual subscriptions receive a 20% discount. All prices are in USD and exclude applicable taxes.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">6.2 Billing</h4>
                  <p>
                    Subscription fees are billed in advance on a monthly or annual basis. By providing payment information,
                    you authorize GenScript to charge all fees to your designated payment method. You are responsible for
                    providing accurate payment information and updating it as needed.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">6.3 Credits</h4>
                  <p>
                    Credits are used to access various features of the Service. Credit costs vary by quality tier and
                    script length. Unused credits do not roll over to the next billing period unless you have an active
                    subscription. Credits purchased as one-time packages do not expire.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">6.4 Refunds</h4>
                  <p>
                    Subscription fees are non-refundable except as required by law or as explicitly stated in our
                    Refund Policy. If you cancel your subscription, you will continue to have access until the end
                    of your current billing period.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">6.5 Price Changes</h4>
                  <p>
                    We may modify our pricing at any time. Price changes will be communicated at least 30 days in advance
                    and will apply to renewals after the notice period. Existing subscribers will be grandfathered at
                    their current rate for the remainder of their current subscription term.
                  </p>
                </LegalSection>

                <LegalSection id="availability" title="7. Service Availability and Modifications">
                  <p>
                    We strive to provide reliable, uninterrupted service, but we cannot guarantee that the Service will
                    be available at all times. The Service may be unavailable due to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Scheduled maintenance and updates</li>
                    <li>Emergency repairs or security updates</li>
                    <li>Third-party service disruptions</li>
                    <li>Events beyond our reasonable control</li>
                  </ul>
                  <p className="mt-4">
                    We reserve the right to modify, suspend, or discontinue any part of the Service at any time. We will
                    provide reasonable notice of significant changes that materially affect your use of the Service.
                  </p>
                </LegalSection>

                <LegalSection id="privacy" title="8. Privacy and Data Protection">
                  <p>
                    Your privacy is important to us. Our collection and use of personal information is governed by our
                    <Link href="/privacy" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 underline"> Privacy Policy</Link>,
                    which is incorporated into these Terms by reference.
                  </p>
                  <p>
                    By using the Service, you consent to our collection, use, and disclosure of your information as
                    described in the Privacy Policy. We implement appropriate technical and organizational measures to
                    protect your data in accordance with applicable data protection laws.
                  </p>
                </LegalSection>

                <LegalSection id="third-party" title="9. Third-Party Services">
                  <p>
                    The Service may integrate with or contain links to third-party services, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>YouTube API Services</li>
                    <li>Payment processors (Stripe)</li>
                    <li>Analytics services</li>
                    <li>Cloud storage providers</li>
                    <li>AI model providers</li>
                  </ul>
                  <p className="mt-4">
                    Your use of third-party services is governed by their respective terms of service and privacy policies.
                    GenScript is not responsible for the practices of third-party services and provides them "as is" without
                    warranties of any kind.
                  </p>
                  <p>
                    By connecting your YouTube account, you agree to be bound by the
                    <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 underline"> YouTube Terms of Service</a> and
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 underline"> Google Privacy Policy</a>.
                  </p>
                </LegalSection>

                <LegalSection id="disclaimers" title="10. Disclaimers and Limitations of Liability" important={true}>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">10.1 Disclaimer of Warranties</h4>
                  <p className="uppercase font-semibold">
                    THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
                    IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                    PURPOSE, TITLE, AND NON-INFRINGEMENT.
                  </p>
                  <p className="mt-4">
                    GenScript does not warrant that:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>The Service will be uninterrupted, timely, secure, or error-free</li>
                    <li>The results from using the Service will be accurate, complete, or reliable</li>
                    <li>Any errors in the Service will be corrected</li>
                    <li>AI-generated content will be free from errors, factual inaccuracies, or bias</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">10.2 AI-Generated Content Disclaimer</h4>
                  <p>
                    AI-generated scripts and content are provided as creative assistance tools. You are solely responsible
                    for reviewing, editing, fact-checking, and ensuring the accuracy of all content before publication.
                    GenScript is not liable for any consequences arising from the use of AI-generated content.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">10.3 Limitation of Liability</h4>
                  <p className="uppercase font-semibold">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, GENSCRIPT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                    SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED
                    DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                  </p>
                  <p className="mt-4">
                    Our total liability to you for all claims arising from or relating to the Service shall not exceed
                    the greater of: (a) the amount you paid to GenScript in the 12 months preceding the claim, or (b) $100 USD.
                  </p>
                </LegalSection>

                <LegalSection id="indemnification" title="11. Indemnification">
                  <p>
                    You agree to indemnify, defend, and hold harmless GenScript, its affiliates, officers, directors,
                    employees, agents, and licensors from and against any claims, liabilities, damages, losses, and
                    expenses, including reasonable attorneys' fees, arising out of or in any way connected with:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Your access to or use of the Service</li>
                    <li>Your violation of these Terms</li>
                    <li>Your violation of any third-party rights, including intellectual property rights</li>
                    <li>Content you generate or publish using the Service</li>
                    <li>Any harm caused to any third party through your use of the Service</li>
                  </ul>
                </LegalSection>

                <LegalSection id="termination" title="12. Termination">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">12.1 Termination by You</h4>
                  <p>
                    You may terminate your account at any time by contacting support or through your account settings.
                    Upon termination, your right to access and use the Service will immediately cease.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">12.2 Termination by GenScript</h4>
                  <p>
                    We may suspend or terminate your access to the Service immediately, without prior notice or liability,
                    for any reason, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Breach of these Terms</li>
                    <li>Violation of our Acceptable Use Policy</li>
                    <li>Fraudulent or illegal activity</li>
                    <li>Non-payment of fees</li>
                    <li>At our sole discretion if we believe termination is necessary to protect the Service or other users</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">12.3 Effect of Termination</h4>
                  <p>
                    Upon termination:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Your right to use the Service will immediately cease</li>
                    <li>We may delete your account and data after 30 days</li>
                    <li>You will not be entitled to any refunds of prepaid fees</li>
                    <li>Sections that by their nature should survive termination will continue to apply</li>
                  </ul>
                </LegalSection>

                <LegalSection id="dispute-resolution" title="13. Dispute Resolution">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">13.1 Informal Resolution</h4>
                  <p>
                    Before filing a claim, you agree to contact us at <a href="mailto:legal@genscript.io" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 underline">legal@genscript.io</a> to
                    attempt to resolve the dispute informally. We will attempt to resolve the dispute through good faith
                    negotiations within 60 days.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">13.2 Binding Arbitration</h4>
                  <p>
                    If we cannot resolve a dispute informally, you and GenScript agree that any dispute arising from or
                    relating to these Terms or the Service will be resolved through binding arbitration, rather than in
                    court, except that you may assert claims in small claims court if your claims qualify.
                  </p>
                  <p className="mt-4">
                    The arbitration will be conducted by the American Arbitration Association (AAA) under its Commercial
                    Arbitration Rules. The arbitrator's decision will be final and binding, and judgment may be entered
                    in any court of competent jurisdiction.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">13.3 Class Action Waiver</h4>
                  <p className="font-semibold">
                    YOU AND GENSCRIPT AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL
                    CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">13.4 Governing Law</h4>
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of the State of Delaware,
                    United States, without regard to its conflict of law provisions.
                  </p>
                </LegalSection>

                <LegalSection id="general" title="14. General Provisions">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">14.1 Entire Agreement</h4>
                  <p>
                    These Terms, together with our Privacy Policy and any other policies referenced herein, constitute
                    the entire agreement between you and GenScript regarding the Service.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">14.2 Severability</h4>
                  <p>
                    If any provision of these Terms is held to be invalid or unenforceable, that provision will be
                    enforced to the maximum extent possible, and the remaining provisions will remain in full force.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">14.3 Waiver</h4>
                  <p>
                    No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term
                    or any other term.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">14.4 Assignment</h4>
                  <p>
                    You may not assign or transfer these Terms or your rights hereunder without our prior written consent.
                    GenScript may assign these Terms without restriction.
                  </p>

                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">14.5 Force Majeure</h4>
                  <p>
                    GenScript shall not be liable for any failure or delay in performance due to causes beyond its
                    reasonable control, including acts of God, war, terrorism, riots, embargoes, acts of civil or
                    military authorities, fire, floods, accidents, strikes, or fuel crises.
                  </p>
                </LegalSection>

                <LegalSection id="business-users" title="15. Specific Terms for Business Users">
                  <p>
                    If you are using the Service on behalf of a business or organization:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You represent and warrant that you have the authority to bind that entity to these Terms</li>
                    <li>Your business agrees to indemnify GenScript from claims arising from your team members' use of the Service</li>
                    <li>Team features are subject to your subscription tier limits</li>
                    <li>You are responsible for managing team member access and permissions</li>
                    <li>Business accounts may require additional verification</li>
                  </ul>
                </LegalSection>

                <LegalSection id="export-controls" title="16. Export Controls and Sanctions">
                  <p>
                    The Service may be subject to U.S. export control laws and regulations. You agree to comply with all
                    applicable export and import control laws and regulations. You represent that:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You are not located in a country subject to U.S. government embargo</li>
                    <li>You are not listed on any U.S. government list of prohibited or restricted parties</li>
                    <li>You will not use the Service in violation of any export restrictions or sanctions</li>
                  </ul>
                </LegalSection>

                <LegalSection id="dmca" title="17. DMCA Policy">
                  <p>
                    GenScript respects the intellectual property rights of others and expects users to do the same. We
                    respond to notices of alleged copyright infringement that comply with the Digital Millennium Copyright
                    Act ("DMCA").
                  </p>
                  <p className="mt-4">
                    If you believe that your work has been copied in a way that constitutes copyright infringement, please
                    provide our Copyright Agent with the following information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>A physical or electronic signature of the copyright owner</li>
                    <li>Identification of the copyrighted work claimed to have been infringed</li>
                    <li>Identification of the material claimed to be infringing</li>
                    <li>Your contact information</li>
                    <li>A statement of good faith belief that the use is not authorized</li>
                    <li>A statement that the information in the notification is accurate</li>
                  </ul>
                  <p className="mt-4">
                    Send DMCA notices to: <a href="mailto:legal@genscript.io" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 underline">legal@genscript.io</a>
                  </p>
                </LegalSection>

                <LegalSection id="beta" title="18. Beta Features">
                  <p>
                    We may offer beta features or early access to new functionality. Beta features are provided "as is"
                    and may contain bugs or errors. We may modify or discontinue beta features at any time without notice.
                    Your use of beta features is at your own risk.
                  </p>
                  <p className="mt-4">
                    By using beta features, you agree to provide feedback and understand that we may use your feedback
                    to improve the Service without any obligation to you.
                  </p>
                </LegalSection>

                <LegalSection id="contact" title="19. Contact Information">
                  <p>
                    If you have questions about these Terms or the Service, please contact us:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mt-4">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-3">GenScript, Inc.</p>
                    <p className="text-gray-600 dark:text-gray-400">Email: <a href="mailto:legal@genscript.io" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 underline">legal@genscript.io</a></p>
                    <p className="text-gray-600 dark:text-gray-400">Support: <a href="mailto:support@genscript.io" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 underline">support@genscript.io</a></p>
                    <p className="text-gray-600 dark:text-gray-400">Website: <a href="https://genscript.io" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 underline">genscript.io</a></p>
                  </div>
                </LegalSection>

                <LegalSection id="modifications" title="20. Modifications to Terms">
                  <p>
                    We reserve the right to modify these Terms at any time. We will notify you of material changes by:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Posting the updated Terms on our website with a new "Last Updated" date</li>
                    <li>Sending an email to your registered email address</li>
                    <li>Displaying a prominent notice on the Service</li>
                  </ul>
                  <p className="mt-4">
                    Material changes will take effect 30 days after notification. Your continued use of the Service after
                    the effective date constitutes acceptance of the modified Terms. If you do not agree to the changes,
                    you must stop using the Service and terminate your account.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500 mt-4">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Stay Informed:</p>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      We recommend reviewing these Terms periodically. You can subscribe to updates at your account
                      settings to receive notifications of changes.
                    </p>
                  </div>
                </LegalSection>

                {/* Related Links */}
                <div className="mt-12 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">Related Documents</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/privacy" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline">
                        Privacy Policy →
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
                  <p>These Terms of Service were last updated on January 1, 2025.</p>
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
