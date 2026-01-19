'use client'

import LegalPageLayout from '@/components/LegalPageLayout'

export default function GDPRPage() {
  return (
    <LegalPageLayout title="GDPR Compliance" lastUpdated="January 19, 2026">
      <p className="text-lg">
        AI Lead Strategies LLC is fully committed to compliance with the European Union's General Data Protection Regulation (GDPR). This page provides detailed information about how we process personal data of EU residents and implement GDPR requirements across all our platforms.
      </p>

      <section>
        <h2>GDPR Overview</h2>
        <p>
          The General Data Protection Regulation (EU) 2016/679 (GDPR) is a comprehensive data protection law that applies to all organizations processing personal data of EU residents, regardless of where the organization is located. As a global provider of AI-powered marketing automation services, we take our GDPR obligations seriously.
        </p>
        <p><strong>Regulation Application:</strong> GDPR applies to our processing of personal data when:</p>
        <ul>
          <li>We offer services to individuals in the EU</li>
          <li>We monitor behavior of individuals in the EU</li>
          <li>We process personal data in the context of our EU business activities</li>
        </ul>
      </section>

      <section>
        <h2>Our Role Under GDPR</h2>
        
        <h3>Data Controller</h3>
        <p>AI Lead Strategies LLC acts as a Data Controller when we determine the purposes and means of processing personal data for our own business operations, including:</p>
        <ul>
          <li>User account management and authentication</li>
          <li>Service provision and platform functionality</li>
          <li>Customer support and communication</li>
          <li>Marketing and business development (with consent)</li>
          <li>Security monitoring and fraud prevention</li>
        </ul>

        <h3>Data Processor</h3>
        <p>We act as a Data Processor when processing personal data on behalf of our customers for their marketing campaigns and lead generation activities:</p>
        <ul>
          <li>Lead data processing for customer campaigns</li>
          <li>Email marketing automation on behalf of customers</li>
          <li>Social media management and engagement</li>
          <li>Analytics and reporting for customer campaigns</li>
        </ul>
      </section>

      <section>
        <h2>Legal Basis for Processing</h2>
        <p>We process personal data only when we have a valid legal basis under GDPR Article 6:</p>

        <h3>Article 6(1)(a) - Consent</h3>
        <ul>
          <li><strong>Marketing Communications:</strong> Direct marketing emails, promotional materials, newsletter subscriptions</li>
          <li><strong>Optional Features:</strong> Advanced analytics, personalized recommendations, third-party integrations</li>
          <li><strong>Cookies:</strong> Non-essential cookies for marketing, analytics, and personalization</li>
        </ul>
        <h4>Consent Management</h4>
        <ul>
          <li>Clear and specific consent requests</li>
          <li>Granular consent options for different processing purposes</li>
          <li>Easy withdrawal mechanisms available at any time</li>
          <li>Regular consent renewal for ongoing marketing activities</li>
        </ul>

        <h3>Article 6(1)(b) - Contract Performance</h3>
        <ul>
          <li><strong>Account Management:</strong> User registration, authentication, profile management</li>
          <li><strong>Service Delivery:</strong> Platform access, feature provision, technical support</li>
          <li><strong>Billing and Payments:</strong> Subscription management, payment processing, invoicing</li>
          <li><strong>Platform Communication:</strong> Service updates, technical notifications, account-related messages</li>
        </ul>

        <h3>Article 6(1)(c) - Legal Obligation</h3>
        <ul>
          <li><strong>Regulatory Compliance:</strong> Tax reporting, financial record keeping, legal document retention</li>
          <li><strong>Law Enforcement:</strong> Response to valid legal requests, court orders, regulatory investigations</li>
          <li><strong>Security Incidents:</strong> Breach notification, incident reporting to supervisory authorities</li>
        </ul>

        <h3>Article 6(1)(f) - Legitimate Interests</h3>
        <ul>
          <li><strong>Platform Security:</strong> Fraud prevention, account security, system monitoring</li>
          <li><strong>Service Improvement:</strong> Usage analytics, performance optimization, feature development</li>
          <li><strong>Business Operations:</strong> Customer support, internal administration, vendor management</li>
          <li><strong>Marketing to Existing Customers:</strong> Service-related communications, similar services promotion</li>
        </ul>
        <p><strong>Legitimate Interest Assessments:</strong> We conduct regular Legitimate Interest Assessments (LIA) to ensure our processing is necessary, proportionate, and balanced against individual privacy rights.</p>
      </section>

      <section>
        <h2>Data Subject Rights</h2>
        <p>Under GDPR, EU residents have specific rights regarding their personal data. We provide multiple mechanisms to exercise these rights:</p>

        <h3>Right of Access (Article 15)</h3>
        <p><strong>What you can access:</strong></p>
        <ul>
          <li>Categories of personal data we process</li>
          <li>Purposes of processing and legal basis</li>
          <li>Recipients of your data</li>
          <li>Data retention periods</li>
          <li>Source of data (if not collected directly from you)</li>
        </ul>
        <p><strong>How to exercise:</strong></p>
        <ul>
          <li>Self-service data export through account settings</li>
          <li>Email request to <a href="mailto:dpo@aileadstrategies.com">dpo@aileadstrategies.com</a></li>
          <li>Comprehensive data report provided within 30 days</li>
        </ul>

        <h3>Right to Rectification (Article 16)</h3>
        <p><strong>What you can correct:</strong></p>
        <ul>
          <li>Inaccurate personal information</li>
          <li>Incomplete data records</li>
          <li>Outdated contact information</li>
          <li>Profile and preference settings</li>
        </ul>
        <p><strong>How to exercise:</strong></p>
        <ul>
          <li>Direct updates through platform account settings</li>
          <li>Support ticket for complex corrections</li>
          <li>Email request to <a href="mailto:dpo@aileadstrategies.com">dpo@aileadstrategies.com</a></li>
        </ul>

        <h3>Right to Erasure / "Right to be Forgotten" (Article 17)</h3>
        <p><strong>When erasure applies:</strong></p>
        <ul>
          <li>Personal data no longer necessary for original purposes</li>
          <li>Consent withdrawal (where consent was the legal basis)</li>
          <li>Objection to legitimate interest processing</li>
          <li>Unlawful processing identification</li>
          <li>Legal obligation for erasure</li>
        </ul>
        <p><strong>Erasure limitations:</strong></p>
        <ul>
          <li>Legal obligation retention requirements</li>
          <li>Freedom of expression and information</li>
          <li>Public interest or scientific research purposes</li>
          <li>Legal claims establishment, exercise, or defense</li>
        </ul>
        <p><strong>How to exercise:</strong></p>
        <ul>
          <li>Account deletion through platform settings</li>
          <li>Email request to <a href="mailto:dpo@aileadstrategies.com">dpo@aileadstrategies.com</a></li>
          <li>Processing completed within 30 days (subject to retention obligations)</li>
        </ul>

        <h3>Right to Restrict Processing (Article 18)</h3>
        <p><strong>When restriction applies:</strong></p>
        <ul>
          <li>Accuracy of data is contested</li>
          <li>Processing is unlawful but erasure is refused</li>
          <li>Data no longer needed but required for legal claims</li>
          <li>Objection pending legitimate interest assessment</li>
        </ul>

        <h3>Right to Data Portability (Article 20)</h3>
        <p><strong>What you can port:</strong></p>
        <ul>
          <li>Account information and profiles</li>
          <li>Campaign data and templates</li>
          <li>Contact lists and lead information</li>
          <li>Usage analytics and reports (where technically feasible)</li>
        </ul>
        <p><strong>Format provided:</strong></p>
        <ul>
          <li>Machine-readable formats (JSON, CSV, XML)</li>
          <li>Direct transfer to another service (where technically feasible)</li>
          <li>Structured data export tools</li>
        </ul>

        <h3>Right to Object (Article 21)</h3>
        <p><strong>Objection grounds:</strong></p>
        <ul>
          <li>Legitimate interest processing (including profiling)</li>
          <li>Direct marketing communications</li>
          <li>Scientific or historical research processing</li>
          <li>Statistical processing</li>
        </ul>
        <p><strong>How to exercise:</strong></p>
        <ul>
          <li>Opt-out links in marketing communications</li>
          <li>Account preferences for profiling and automation</li>
          <li>Email request to <a href="mailto:dpo@aileadstrategies.com">dpo@aileadstrategies.com</a></li>
        </ul>

        <h3>Rights Related to Automated Decision Making (Article 22)</h3>
        <p><strong>Automated decisions in our services:</strong></p>
        <ul>
          <li>Lead scoring and qualification</li>
          <li>Content personalization and recommendations</li>
          <li>Campaign optimization and timing</li>
          <li>Fraud detection and security measures</li>
        </ul>
        <p><strong>Your rights:</strong></p>
        <ul>
          <li>Human review of automated decisions</li>
          <li>Explanation of automated decision logic</li>
          <li>Contest automated decisions</li>
          <li>Opt-out of automated decision making (where feasible)</li>
        </ul>
      </section>

      <section>
        <h2>International Data Transfers</h2>
        <p>As a US-based company serving EU customers, we implement appropriate safeguards for international data transfers:</p>

        <h3>Transfer Mechanisms</h3>
        <h4>Standard Contractual Clauses (SCCs)</h4>
        <ul>
          <li>European Commission approved SCCs for all international transfers</li>
          <li>Regular review and updates as per European Data Protection Board guidance</li>
          <li>Supplementary measures assessment for high-risk transfers</li>
        </ul>

        <h4>Adequacy Decisions</h4>
        <ul>
          <li>Recognition of countries with adequate protection levels</li>
          <li>Monitoring of adequacy decision changes and implications</li>
          <li>Adjustment of transfer mechanisms as necessary</li>
        </ul>

        <h3>Transfer Recipients</h3>
        <p><strong>Primary Recipients:</strong></p>
        <ul>
          <li>Railway (Cloud Infrastructure) - US with SCCs</li>
          <li>PostgreSQL hosting providers - Various locations with SCCs</li>
          <li>Payment processors - Various locations with adequacy decisions or SCCs</li>
          <li>AI service providers (OpenAI, Anthropic) - US with SCCs</li>
        </ul>
        <p><strong>Transfer Safeguards:</strong></p>
        <ul>
          <li>Contractual data protection obligations</li>
          <li>Technical and organizational measures</li>
          <li>Regular compliance assessments</li>
          <li>Incident notification procedures</li>
        </ul>
      </section>

      <section>
        <h2>Data Retention and Deletion</h2>
        <p>We implement comprehensive data retention policies compliant with GDPR principles:</p>

        <h3>Retention Periods</h3>
        <h4>Account Data</h4>
        <ul>
          <li>Active accounts: Duration of service relationship plus 7 years for legal obligations</li>
          <li>Deleted accounts: 30 days for recovery, then permanent deletion (subject to legal retention)</li>
          <li>Payment records: 7 years for tax and accounting obligations</li>
        </ul>

        <h4>Marketing Data</h4>
        <ul>
          <li>Consented marketing: Until consent withdrawal plus 2 years for evidence</li>
          <li>Legitimate interest marketing: 2 years from last interaction or objection</li>
          <li>Marketing analytics: 26 months (aligned with ePrivacy Directive)</li>
        </ul>

        <h4>Support and Communication</h4>
        <ul>
          <li>Support tickets: 3 years for service improvement and legal protection</li>
          <li>Communication records: 7 years for legal and compliance purposes</li>
          <li>Security logs: 1 year for security monitoring and incident response</li>
        </ul>

        <h3>Automated Deletion</h3>
        <ul>
          <li><strong>Scheduled Deletion Jobs:</strong> Automated removal of data beyond retention periods</li>
          <li><strong>Account Deletion:</strong> Immediate removal of personal data upon account deletion request</li>
          <li><strong>Consent Withdrawal:</strong> Automatic cessation of processing and scheduled deletion</li>
          <li><strong>Data Minimization:</strong> Regular review and deletion of unnecessary data</li>
        </ul>
      </section>

      <section>
        <h2>Breach Notification</h2>
        <p>We maintain comprehensive procedures for data breach detection, assessment, and notification:</p>

        <h3>Internal Procedures</h3>
        <ol>
          <li><strong>Detection:</strong> 24/7 monitoring through our Healing Sentinel AI agent</li>
          <li><strong>Assessment:</strong> Rapid risk evaluation within 4 hours of detection</li>
          <li><strong>Containment:</strong> Immediate measures to prevent further breaches</li>
          <li><strong>Documentation:</strong> Complete incident records and evidence preservation</li>
        </ol>

        <h3>Regulatory Notification</h3>
        <ul>
          <li><strong>Supervisory Authority:</strong> Notification within 72 hours of becoming aware (where required)</li>
          <li><strong>Data Subjects:</strong> Direct notification without undue delay (where high risk exists)</li>
          <li><strong>Documentation:</strong> Breach register maintenance with all required details</li>
        </ul>
      </section>

      <section>
        <h2>Data Protection Officer (DPO)</h2>
        <div className="bg-[#050505] border border-white/10 rounded-lg p-6 not-prose">
          <p className="text-sm text-neutral-400">
            <strong className="text-white">Contact:</strong> <a href="mailto:dpo@aileadstrategies.com" className="text-purple-400 hover:text-purple-300">dpo@aileadstrategies.com</a>
          </p>
          <p className="text-sm text-neutral-400 mt-1">
            <strong className="text-white">Response Time:</strong> 48 hours for urgent matters, 5 business days for standard inquiries
          </p>
        </div>

        <p className="mt-4"><strong>DPO Responsibilities:</strong></p>
        <ul>
          <li>GDPR compliance monitoring and advisory</li>
          <li>Data protection impact assessment oversight</li>
          <li>Supervisory authority liaison and communication</li>
          <li>Data protection training and awareness programs</li>
          <li>Privacy complaint investigation and resolution</li>
        </ul>
      </section>

      <section>
        <h2>Contact Information</h2>
        
        <h3>GDPR Inquiries</h3>
        <div className="bg-[#050505] border border-white/10 rounded-lg p-6 not-prose">
          <p className="text-sm text-neutral-400">
            <strong className="text-white">Data Protection Officer:</strong> <a href="mailto:dpo@aileadstrategies.com" className="text-purple-400 hover:text-purple-300">dpo@aileadstrategies.com</a>
          </p>
          <p className="text-sm text-neutral-400 mt-1">
            <strong className="text-white">GDPR Compliance Team:</strong> <a href="mailto:gdpr@aileadstrategies.com" className="text-purple-400 hover:text-purple-300">gdpr@aileadstrategies.com</a>
          </p>
          <p className="text-sm text-neutral-400 mt-1">
            <strong className="text-white">Privacy Rights Requests:</strong> <a href="mailto:privacy@aileadstrategies.com" className="text-purple-400 hover:text-purple-300">privacy@aileadstrategies.com</a>
          </p>
        </div>

        <h3>Company Information</h3>
        <div className="bg-[#050505] border border-white/10 rounded-lg p-6 not-prose mt-4">
          <p className="font-semibold text-white mb-2">AI Lead Strategies LLC</p>
          <p className="text-sm text-neutral-400">600 Eagleview Blvd, Suite 317</p>
          <p className="text-sm text-neutral-400">Exton, PA 19341, United States</p>
          <p className="text-sm text-neutral-400 mt-2">
            Phone: <a href="tel:6107571587" className="text-purple-400 hover:text-purple-300">610.757.1587</a>
          </p>
        </div>
      </section>

      <p className="text-sm text-neutral-500 italic mt-8">
        This GDPR compliance documentation is reviewed and updated regularly to ensure ongoing compliance with the regulation and guidance from supervisory authorities. For the most current information about our data processing activities, please refer to our Privacy Policy.
      </p>
    </LegalPageLayout>
  )
}
