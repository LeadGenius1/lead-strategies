'use client'

import LegalPageLayout from '@/components/LegalPageLayout'

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="January 19, 2026">
      <section>
        <h2>Introduction</h2>
        <p>
          AI Lead Strategies LLC ("we," "our," or "us") is committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platforms and services, including LeadSite.AI, LeadSite.IO, ClientContact.IO, VideoSite.AI, and related services (collectively, the "Services").
        </p>
      </section>

      <section>
        <h2>Company Information</h2>
        <div className="bg-[#050505] border border-white/10 rounded-lg p-6 not-prose">
          <p className="font-semibold text-white mb-2">AI Lead Strategies LLC</p>
          <p className="text-sm text-neutral-400">600 Eagleview Blvd, Suite 317</p>
          <p className="text-sm text-neutral-400">Exton, PA 19341</p>
          <p className="text-sm text-neutral-400">United States</p>
          <p className="text-sm text-neutral-400 mt-2">
            Phone: <a href="tel:8555068886" className="text-purple-400 hover:text-purple-300">(855) 506-8886</a>
          </p>
          <p className="text-sm text-neutral-400">
            Email: <a href="mailto:support@aileadstrategies.com" className="text-purple-400 hover:text-purple-300">support@aileadstrategies.com</a>
          </p>
        </div>
      </section>

      <section>
        <h2>Information We Collect</h2>
        
        <h3>Personal Information You Provide</h3>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, phone number, company information</li>
          <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely through third-party providers)</li>
          <li><strong>Profile Information:</strong> Job title, industry, business objectives, marketing preferences</li>
          <li><strong>Communication Data:</strong> Messages, feedback, support requests, and correspondence with us</li>
          <li><strong>Content Data:</strong> Videos, images, marketing materials, lead data, and other content you upload or create</li>
        </ul>

        <h3>Information Collected Automatically</h3>
        <ul>
          <li><strong>Usage Data:</strong> Platform interactions, feature usage, session duration, click patterns</li>
          <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
          <li><strong>Location Data:</strong> General geographic location based on IP address</li>
          <li><strong>Cookies and Tracking:</strong> Website usage patterns, preferences, authentication tokens</li>
        </ul>

        <h3>Third-Party Information</h3>
        <ul>
          <li><strong>Lead Data:</strong> Contact information, company details, social media profiles obtained through our lead generation services</li>
          <li><strong>Integration Data:</strong> Information from connected platforms (CRM systems, email providers, social media)</li>
          <li><strong>Analytics Data:</strong> Performance metrics, campaign effectiveness, engagement statistics</li>
        </ul>
      </section>

      <section>
        <h2>How We Use Your Information</h2>
        
        <h3>Core Business Operations</h3>
        <ul>
          <li>Providing and maintaining our AI-powered lead generation and marketing automation services</li>
          <li>Processing payments and managing subscriptions across all platform tiers ($49-$499/month, VideoSite.AI is FREE)</li>
          <li>Delivering personalized recommendations and optimizing platform performance</li>
          <li>Facilitating communication between users and prospects through our multi-channel outreach</li>
        </ul>

        <h3>AI and Machine Learning Services</h3>
        <ul>
          <li>Training and improving our 7-agent AI system powered by Claude 4.1 Sonnet</li>
          <li>Generating personalized marketing content, email sequences, and outreach campaigns</li>
          <li>Analyzing lead behavior and engagement patterns to enhance targeting</li>
          <li>Automating workflow processes and optimizing conversion rates</li>
        </ul>

        <h3>Communication and Support</h3>
        <ul>
          <li>Sending service updates, feature announcements, and platform notifications</li>
          <li>Providing customer support and technical assistance</li>
          <li>Responding to inquiries and processing feedback</li>
          <li>Delivering educational content and best practices guidance</li>
        </ul>
      </section>

      <section>
        <h2>Information Sharing and Disclosure</h2>
        
        <h3>Service Providers and Partners</h3>
        <p>We share information with trusted third-party providers who assist in:</p>
        <ul>
          <li><strong>Cloud Infrastructure:</strong> Railway (hosting), PostgreSQL (database management)</li>
          <li><strong>Payment Processing:</strong> Secure payment gateway providers</li>
          <li><strong>Communication Services:</strong> Email delivery, SMS providers, social media platforms</li>
          <li><strong>Analytics:</strong> Performance monitoring and usage analytics</li>
          <li><strong>AI Services:</strong> OpenAI, Anthropic (Claude), and other AI/ML providers</li>
        </ul>

        <h3>Business Transfers</h3>
        <p>Information may be transferred in connection with mergers, acquisitions, or asset sales, subject to confidentiality protections.</p>

        <h3>Legal Requirements</h3>
        <p>We may disclose information when required by law, court order, or to:</p>
        <ul>
          <li>Protect our legal rights and property</li>
          <li>Ensure platform security and prevent fraud</li>
          <li>Comply with regulatory obligations</li>
          <li>Respond to valid legal requests from authorities</li>
        </ul>
      </section>

      <section>
        <h2>Data Storage and Security</h2>
        
        <h3>Security Measures</h3>
        <ul>
          <li><strong>Encryption:</strong> Data encrypted in transit and at rest using industry-standard protocols</li>
          <li><strong>Access Controls:</strong> Multi-factor authentication, role-based permissions, regular access reviews</li>
          <li><strong>Infrastructure Security:</strong> Secure cloud hosting with Railway, regular security updates</li>
          <li><strong>Monitoring:</strong> 24/7 security monitoring with our Healing Sentinel AI agent</li>
          <li><strong>Data Backups:</strong> Regular automated backups with disaster recovery procedures</li>
        </ul>

        <h3>Data Retention</h3>
        <ul>
          <li><strong>Active Accounts:</strong> Data retained while account remains active and for legitimate business purposes</li>
          <li><strong>Lead Data:</strong> Maintained according to campaign requirements and user preferences</li>
          <li><strong>Communication Records:</strong> Retained for up to 7 years for compliance and support purposes</li>
          <li><strong>Analytics Data:</strong> Aggregated data may be retained indefinitely for service improvement</li>
        </ul>
      </section>

      <section>
        <h2>Your Rights and Choices</h2>
        
        <h3>Account Management</h3>
        <ul>
          <li>Access and update your personal information through platform settings</li>
          <li>Download your data in machine-readable formats</li>
          <li>Delete your account and associated data (subject to legal retention requirements)</li>
          <li>Manage communication preferences and marketing subscriptions</li>
        </ul>

        <h3>Data Portability</h3>
        <p>Request export of your data in commonly used formats for transfer to other services.</p>

        <h3>Opt-Out Rights</h3>
        <ul>
          <li>Unsubscribe from marketing communications (service-related messages may continue)</li>
          <li>Disable certain data collection features through platform settings</li>
          <li>Request removal from lead generation databases where legally permissible</li>
        </ul>
      </section>

      <section>
        <h2>Regional Privacy Rights</h2>
        
        <h3>GDPR (European Union)</h3>
        <p>Under the General Data Protection Regulation, EU residents have additional rights including:</p>
        <ul>
          <li><strong>Right to Access:</strong> Request information about data processing</li>
          <li><strong>Right to Rectification:</strong> Correct inaccurate personal information</li>
          <li><strong>Right to Erasure:</strong> Request deletion of personal data</li>
          <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
          <li><strong>Right to Data Portability:</strong> Receive data in portable format</li>
          <li><strong>Right to Object:</strong> Opt-out of certain processing activities</li>
          <li><strong>Rights Related to Automated Decision Making:</strong> Human review of automated decisions</li>
        </ul>
        <p><strong>Legal Basis for Processing:</strong> Consent, contract performance, legitimate interests, legal compliance</p>

        <h3>CCPA (California)</h3>
        <p>California residents have rights under the California Consumer Privacy Act including:</p>
        <ul>
          <li><strong>Right to Know:</strong> Information about data collection and use</li>
          <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
          <li><strong>Right to Opt-Out:</strong> Refuse sale of personal information</li>
          <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
        </ul>
        <p><strong>Note:</strong> We do not sell personal information to third parties.</p>
      </section>

      <section>
        <h2>International Data Transfers</h2>
        <p>Data may be processed in countries outside your residence. We implement appropriate safeguards including:</p>
        <ul>
          <li>Standard Contractual Clauses for EU data transfers</li>
          <li>Privacy Shield successor frameworks where applicable</li>
          <li>Adequacy decisions from relevant authorities</li>
          <li>Explicit consent when required</li>
        </ul>
      </section>

      <section>
        <h2>Children's Privacy</h2>
        <p>Our services are not directed to individuals under 18. We do not knowingly collect personal information from children. If we discover such collection, we will delete the information immediately.</p>
      </section>

      <section>
        <h2>Cookie Policy</h2>
        <p>We use cookies and similar technologies for:</p>
        <ul>
          <li><strong>Essential Cookies:</strong> Platform functionality, authentication, security</li>
          <li><strong>Analytics Cookies:</strong> Usage statistics, performance monitoring</li>
          <li><strong>Preference Cookies:</strong> Settings, customization, user experience</li>
          <li><strong>Marketing Cookies:</strong> Campaign effectiveness, retargeting (with consent)</li>
        </ul>
        <p>Manage cookie preferences through your browser settings or our cookie preference center.</p>
      </section>

      <section>
        <h2>Changes to This Policy</h2>
        <p>We may update this Privacy Policy to reflect changes in our practices or legal requirements. Material changes will be communicated through:</p>
        <ul>
          <li>Email notifications to registered users</li>
          <li>Prominent website notices</li>
          <li>Platform notifications</li>
        </ul>
        <p>Continued use after changes constitutes acceptance of the updated policy.</p>
      </section>

      <section>
        <h2>Contact Information</h2>
        
        <h3>Privacy Questions</h3>
        <p>For privacy-related inquiries, concerns, or rights requests:</p>
        <div className="bg-[#050505] border border-white/10 rounded-lg p-6 not-prose">
          <p className="text-sm text-neutral-400">
            <strong className="text-white">Email:</strong> <a href="mailto:privacy@aileadstrategies.com" className="text-purple-400 hover:text-purple-300">privacy@aileadstrategies.com</a>
          </p>
          <p className="text-sm text-neutral-400 mt-2">
            <strong className="text-white">Mail:</strong> AI Lead Strategies LLC, Attention: Privacy Officer, 600 Eagleview Blvd, Suite 317, Exton, PA 19341
          </p>
        </div>

        <h3>Data Protection Officer (DPO)</h3>
        <p>For GDPR-related matters: <a href="mailto:dpo@aileadstrategies.com">dpo@aileadstrategies.com</a></p>

        <h3>Response Time</h3>
        <p>We aim to respond to privacy requests within 30 days (or as required by applicable law).</p>
      </section>

      <p className="text-sm text-neutral-500 italic mt-8">
        This Privacy Policy is effective as of the date listed above and governs all AI Lead Strategies LLC platforms and services.
      </p>
    </LegalPageLayout>
  )
}
