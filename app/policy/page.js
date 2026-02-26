'use client';

import { useState } from 'react';
import Link from 'next/link';

const TABS = [
  { id: 'terms', label: 'Terms of Service' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'acceptable-use', label: 'Acceptable Use Policy' },
  { id: 'advertiser', label: 'Advertiser Agreement' },
];

function TermsOfService() {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-white font-semibold text-base mb-3">1. Acceptance of Terms</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          By accessing or using any platform operated by AI Lead Strategies LLC ("AILS", "we", "us"), including LeadSite.IO, LeadSite.AI, ClientContact.IO, VideoSite.AI, and UltraLead.AI, you agree to be bound by these Terms of Service. If you do not agree, you must not use our platforms. We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance of updated terms.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">2. Platform Descriptions</h3>
        <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
          <p><span className="text-white font-medium">LeadSite.IO</span> — AI-powered website builder with lead capture forms, subdomain hosting, and custom domain support.</p>
          <p><span className="text-white font-medium">LeadSite.AI</span> — Email-based lead generation platform with lead hunting, prospect management, campaign orchestration, and reply tracking.</p>
          <p><span className="text-white font-medium">ClientContact.IO</span> — Unified inbox platform aggregating 22+ communication channels including email, SMS, live chat, and social media messaging.</p>
          <p><span className="text-white font-medium">VideoSite.AI</span> — Free video monetization platform where content creators earn $1.00 per qualified video view (30+ seconds watch time, click-through, or form submission).</p>
          <p><span className="text-white font-medium">UltraLead.AI</span> — All-in-one dashboard combining all platform capabilities plus CRM, deal pipeline, AI copywriting, and advanced analytics.</p>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">3. Billing & Pricing</h3>
        <div className="space-y-2 text-gray-300 text-sm leading-relaxed">
          <p>Subscriptions are billed monthly via Stripe. All prices are in USD. Pricing for each platform:</p>
          <ul className="list-none space-y-1.5 mt-2 ml-1">
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> <span><span className="text-white">LeadSite.IO:</span> Starter $49/mo | Professional $149/mo | Enterprise $349/mo</span></li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> <span><span className="text-white">LeadSite.AI:</span> Starter $49/mo | Professional $149/mo | Enterprise $349/mo</span></li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> <span><span className="text-white">ClientContact.IO:</span> Starter $99/mo | Professional $149/mo | Enterprise $399/mo</span></li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> <span><span className="text-white">VideoSite.AI:</span> Free for creators | Advertiser pricing: $0.05–$0.20 per qualified view</span></li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> <span><span className="text-white">UltraLead.AI:</span> $499/mo (includes all platform features)</span></li>
          </ul>
          <p className="mt-3">All new accounts include a 14-day free trial. No credit card is required during trial. You may cancel at any time before the trial ends without charge. Refunds are not provided for partial months after the billing cycle begins.</p>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">4. Intellectual Property</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          All platform code, design, branding, and documentation are the exclusive property of AI Lead Strategies LLC. Users retain full ownership of their content, data, leads, and generated materials. By uploading content, you grant AILS a limited, non-exclusive license to host and display your content solely for platform operation. You may export your data at any time. Upon account termination, we retain data for 30 days before permanent deletion.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">5. Account Termination</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          You may cancel your account at any time through the dashboard settings. AILS reserves the right to suspend or terminate accounts that violate these Terms, the Acceptable Use Policy, or engage in fraudulent activity. Upon termination: (a) access to all platforms ceases immediately, (b) outstanding invoices remain due, (c) data is retained for 30 days then permanently deleted, and (d) remaining advertiser budget is forfeited if terminated for cause.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">6. Limitation of Liability</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, AILS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORMS. Our total liability for any claim shall not exceed the amount you paid to AILS in the 12 months preceding the claim. The platforms are provided "as is" and "as available" without warranties of any kind, whether express or implied.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">7. Governing Law</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          These Terms shall be governed by and construed in accordance with the laws of the Commonwealth of Pennsylvania, without regard to conflict of law provisions. Any dispute arising under these Terms shall be resolved in the state or federal courts located in Chester County, Pennsylvania. Both parties consent to exclusive jurisdiction and venue in such courts.
        </p>
      </section>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-white font-semibold text-base mb-3">1. Data We Collect</h3>
        <div className="text-gray-300 text-sm leading-relaxed space-y-2">
          <p><span className="text-white font-medium">Account Data:</span> Name, email address, password (hashed), business name, phone number, and website URL provided during registration.</p>
          <p><span className="text-white font-medium">Usage Data:</span> Pages visited, features used, IP address, browser type, device information, session duration, and referral source.</p>
          <p><span className="text-white font-medium">Content Data:</span> Videos, images, documents, leads, email campaigns, and other content you upload or create on our platforms.</p>
          <p><span className="text-white font-medium">Payment Data:</span> Billing information is processed and stored by Stripe. We do not store credit card numbers on our servers.</p>
          <p><span className="text-white font-medium">Communication Data:</span> Emails sent/received through our platforms, SMS messages (ClientContact.IO), and support tickets.</p>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">2. GDPR Rights (EU/EEA Users)</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          If you are located in the European Economic Area, you have the following rights under the General Data Protection Regulation (GDPR): right of access to your personal data; right to rectification of inaccurate data; right to erasure ("right to be forgotten"); right to restrict processing; right to data portability; and right to object to processing. To exercise any of these rights, contact legal@aileadstrategies.com. We will respond within 30 days.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">3. CCPA Rights (California Residents)</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          Under the California Consumer Privacy Act (CCPA), California residents have the right to: know what personal information is collected; request deletion of personal information; opt out of the sale of personal information; and non-discrimination for exercising privacy rights. AILS does not sell personal information to third parties. To submit a CCPA request, email legal@aileadstrategies.com with subject line "CCPA Request."
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">4. COPPA Compliance</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          Our platforms are not directed to children under 13. We do not knowingly collect personal information from children under 13 years of age. If we learn that we have collected personal information from a child under 13, we will promptly delete that information. If you believe a child under 13 has provided us with personal information, contact us at legal@aileadstrategies.com.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">5. Data Retention</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          Active account data is retained for the duration of your subscription. Upon account termination or cancellation, all user data (including leads, content, campaigns, and analytics) is retained for 30 days to allow for account recovery or data export. After 30 days, data is permanently and irrecoverably deleted from our systems and backups. Payment records may be retained longer as required by tax and financial regulations.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">6. Third-Party Services</h3>
        <div className="text-gray-300 text-sm leading-relaxed space-y-2">
          <p>We use the following third-party services to operate our platforms:</p>
          <ul className="list-none space-y-1.5 mt-2 ml-1">
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> <span><span className="text-white">Stripe</span> — Payment processing. Subject to <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Stripe&apos;s Privacy Policy</a>.</span></li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> <span><span className="text-white">Cloudflare R2</span> — Video and file storage with global CDN delivery.</span></li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> <span><span className="text-white">Railway</span> — Application hosting and PostgreSQL database infrastructure.</span></li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> <span><span className="text-white">Mailgun</span> — Email delivery service for campaigns and transactional emails.</span></li>
          </ul>
          <p className="mt-2">We do not share your personal information with third parties for marketing purposes. Data shared with service providers is limited to what is necessary for platform operation.</p>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">7. Cookies & Tracking</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          We use essential cookies for authentication (JWT session tokens) and platform functionality. We do not use third-party advertising cookies or cross-site tracking. Analytics data is collected server-side and is not shared with external analytics providers.
        </p>
      </section>
    </div>
  );
}

function AcceptableUsePolicy() {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-white font-semibold text-base mb-3">1. CAN-SPAM Compliance (Email)</h3>
        <div className="text-gray-300 text-sm leading-relaxed space-y-2">
          <p>All email campaigns sent through LeadSite.AI or ClientContact.IO must comply with the CAN-SPAM Act:</p>
          <ul className="list-none space-y-1.5 mt-2 ml-1">
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Include accurate sender information and a valid physical postal address</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Subject lines must not be deceptive or misleading</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Every email must contain a clear, functioning unsubscribe mechanism</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Unsubscribe requests must be honored within 10 business days</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Commercial emails must be identified as advertisements where required</li>
          </ul>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">2. TCPA Compliance (SMS)</h3>
        <div className="text-gray-300 text-sm leading-relaxed space-y-2">
          <p>SMS messaging through ClientContact.IO must comply with the Telephone Consumer Protection Act (TCPA):</p>
          <ul className="list-none space-y-1.5 mt-2 ml-1">
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Obtain prior express written consent before sending marketing SMS</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Provide clear opt-out instructions (e.g., "Reply STOP to unsubscribe")</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Do not send messages before 8 AM or after 9 PM in the recipient&apos;s time zone</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Maintain records of consent for all recipients</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Users are solely responsible for TCPA compliance of their SMS campaigns</li>
          </ul>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">3. Content Standards</h3>
        <div className="text-gray-300 text-sm leading-relaxed space-y-2">
          <p>Content uploaded, published, or distributed through any AILS platform must not contain:</p>
          <ul className="list-none space-y-1.5 mt-2 ml-1">
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Illegal content or content promoting illegal activities</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Sexually explicit or pornographic material</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Content promoting violence, hate speech, or discrimination</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Content infringing on intellectual property rights of others</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Malware, phishing, or other malicious code or links</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Deceptive, fraudulent, or misleading claims</li>
          </ul>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">4. Platform-Specific Rules</h3>
        <div className="text-gray-300 text-sm leading-relaxed space-y-3">
          <p><span className="text-white font-medium">LeadSite.IO:</span> Websites generated must not impersonate other businesses, contain phishing pages, or violate trademark law. Subdomain names must not be offensive or misleading.</p>
          <p><span className="text-white font-medium">LeadSite.AI:</span> Lead lists must be legally obtained. Purchased or scraped email lists from third-party sources without proper consent are prohibited. Bounce rates exceeding 10% may result in account review.</p>
          <p><span className="text-white font-medium">ClientContact.IO:</span> Users must comply with all applicable communication laws in their jurisdiction. Automated messages must be clearly identified. Do not use the platform for robocalling or unsolicited bulk messaging.</p>
          <p><span className="text-white font-medium">VideoSite.AI:</span> Uploaded videos must not contain copyrighted content without authorization. View manipulation (bots, click farms, artificial inflation) is strictly prohibited and will result in account termination and forfeiture of earnings.</p>
          <p><span className="text-white font-medium">UltraLead.AI:</span> All rules from individual platforms apply. CRM data must be obtained through legitimate business relationships.</p>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">5. Prohibited Activities</h3>
        <div className="text-gray-300 text-sm leading-relaxed space-y-2">
          <p>The following activities are strictly prohibited across all AILS platforms:</p>
          <ul className="list-none space-y-1.5 mt-2 ml-1">
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Attempting to gain unauthorized access to other accounts or systems</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Reverse engineering, decompiling, or disassembling platform code</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Using the platform to send spam or unsolicited bulk communications</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Automated scraping, crawling, or data extraction beyond API rate limits</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Reselling, sublicensing, or redistributing platform access</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Manipulating view counts, engagement metrics, or analytics data</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Using the platform for money laundering or financial fraud</li>
          </ul>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">6. Enforcement</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          Violations of this policy may result in: warning and required corrective action; temporary suspension of account access; permanent account termination; forfeiture of remaining credits, earnings, or advertiser budget; and/or legal action where appropriate. AILS reserves the right to determine, in its sole discretion, whether a violation has occurred and what enforcement action to take.
        </p>
      </section>
    </div>
  );
}

function AdvertiserAgreement() {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-white font-semibold text-base mb-3">1. Eligibility</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          To create an advertiser account on VideoSite.AI, you must: be at least 18 years of age; represent a legitimate business entity or be an authorized individual; provide accurate business name, contact name, and email address; and accept this Advertiser Agreement during registration. AILS reserves the right to reject or terminate advertiser accounts at its sole discretion.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">2. 10-Point Campaign Review</h3>
        <div className="text-gray-300 text-sm leading-relaxed space-y-2">
          <p>All campaign submissions undergo an automated 10-point review. Campaigns scoring 8/10 or higher are approved automatically. The review checks:</p>
          <ul className="list-none space-y-1.5 mt-2 ml-1">
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">1.</span> Video URL uses HTTPS</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">2.</span> Landing page URL uses HTTPS</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">3.</span> Budget meets minimum threshold ($100)</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">4.</span> Campaign name is at least 4 characters</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">5.</span> Category is provided</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">6.</span> Valid tier selected (Starter, Professional, or Premium)</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">7.</span> No prohibited keywords in campaign name</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">8.</span> No competitor brand violations</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">9.</span> Budget does not exceed maximum ($1,000,000)</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">10.</span> Advertiser agreement has been accepted</li>
          </ul>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">3. Pricing Tiers</h3>
        <div className="text-gray-300 text-sm leading-relaxed space-y-2">
          <p>Advertiser campaigns are available in three tiers:</p>
          <ul className="list-none space-y-1.5 mt-2 ml-1">
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> <span><span className="text-white">Starter:</span> $0.05 per qualified view — Standard placement, basic category targeting, campaign analytics</span></li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> <span><span className="text-white">Professional:</span> $0.10 per qualified view — Priority placement, advanced audience targeting, detailed analytics</span></li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> <span><span className="text-white">Premium:</span> $0.20 per qualified view — Exclusive top-of-feed placement, custom audience segments, conversion tracking</span></li>
          </ul>
          <p className="mt-2">Campaign budgets are charged upfront. Once a campaign is live and serving impressions, spent budget is non-refundable. You may pause a campaign at any time; unspent budget remains available.</p>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">4. Prohibited Content</h3>
        <div className="text-gray-300 text-sm leading-relaxed space-y-2">
          <p>The following content categories are strictly prohibited in all ad campaigns:</p>
          <ul className="list-none space-y-1.5 mt-2 ml-1">
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Adult, sexually explicit, or pornographic content</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Gambling, casino, or sports betting promotions</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Weapons, ammunition, or explosives</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Illegal drugs or controlled substances</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Political campaigns or issue-based advocacy advertising</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Misleading, deceptive, or fraudulent claims</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Tobacco, vaping, or nicotine products</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">&#8226;</span> Multi-level marketing (MLM) or pyramid schemes</li>
          </ul>
          <p className="mt-2">Ads containing prohibited content will be automatically rejected during the 10-point review or manually removed upon discovery.</p>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">5. FTC Disclosure Requirements</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          All advertisements must comply with the Federal Trade Commission (FTC) guidelines. Ads must be clearly identifiable as advertisements or sponsored content. The platform automatically labels ad placements as "Sponsored" or "Ad" in the viewer interface. Advertisers must not make false or unsubstantiated claims about their products or services. Testimonials must reflect honest opinions and typical results. Any material connection between the advertiser and endorser must be clearly disclosed.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">6. International Compliance</h3>
        <div className="text-gray-300 text-sm leading-relaxed space-y-3">
          <p><span className="text-white font-medium">GDPR (EU/EEA):</span> Advertisers targeting EU/EEA audiences must comply with the General Data Protection Regulation. Landing pages must include a privacy policy, cookie consent mechanism, and lawful basis for data processing. Data collected through ad click-throughs must be handled in accordance with GDPR requirements.</p>
          <p><span className="text-white font-medium">EU Digital Services Act (DSA):</span> Ad content must comply with the DSA transparency requirements. Advertisers must provide accurate identity information. Targeted advertising based on sensitive personal data (religion, political views, health) is prohibited under the DSA.</p>
          <p><span className="text-white font-medium">UK ASA (Advertising Standards Authority):</span> Ads targeting UK audiences must comply with the UK Code of Non-broadcast Advertising and Direct &amp; Promotional Marketing (CAP Code). Ads must be legal, decent, honest, and truthful. Comparisons with competitors must be verifiable and fair.</p>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold text-base mb-3">7. Violations & Termination</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          Violations of this Advertiser Agreement — including submitting prohibited content, manipulating view counts, engaging in fraudulent activity, or violating FTC/international advertising laws — will result in immediate account termination and forfeiture of remaining campaign budget. AILS reserves the right to report violations to relevant regulatory authorities. Advertisers are solely responsible for ensuring their ads comply with all applicable laws in their target jurisdictions.
        </p>
      </section>
    </div>
  );
}

export default function PolicyCenterPage() {
  const [activeTab, setActiveTab] = useState('terms');

  const tabContent = {
    terms: <TermsOfService />,
    privacy: <PrivacyPolicy />,
    'acceptable-use': <AcceptableUsePolicy />,
    advertiser: <AdvertiserAgreement />,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white antialiased">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors">
            &larr; AI Lead Strategies
          </Link>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500 mt-4 mb-2">
            AI Lead Strategies — Policy Center
          </h1>
          <p className="text-purple-400 text-sm font-medium">Effective February 26, 2026</p>
          <p className="text-gray-400 text-sm mt-1">These policies govern use of all AILS platforms</p>
        </div>

        {/* Tab Switcher */}
        <div className="border-b border-gray-800 mb-8 overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Policy Content Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 mb-12">
          <h2 className="text-xl font-semibold text-white mb-6 pb-4 border-b border-gray-800">
            {TABS.find(t => t.id === activeTab)?.label}
          </h2>
          {tabContent[activeTab]}
        </div>

        {/* Bottom Info */}
        <div className="text-center space-y-4 pb-8">
          <p className="text-gray-400 text-sm">
            Questions? Contact{' '}
            <a href="mailto:legal@aileadstrategies.com" className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors">
              legal@aileadstrategies.com
            </a>
          </p>
          <p className="text-gray-500 text-xs">
            AI Lead Strategies LLC | 600 Eagleview Blvd, Suite 317, Exton PA 19341
          </p>
          <a
            href="/policy/AILS-Policy-Center.pdf"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Policy PDF
          </a>
        </div>
      </div>
    </div>
  );
}
