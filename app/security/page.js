'use client'

import LegalPageLayout from '@/components/LegalPageLayout'

export default function SecurityPage() {
  return (
    <LegalPageLayout title="Security" lastUpdated="January 19, 2026">
      <p className="text-lg">
        At AI Lead Strategies LLC, security is not just a priority—it's fundamental to everything we do. We understand that your business data, lead information, and campaign strategies are invaluable assets that require the highest level of protection.
      </p>

      <section>
        <h2>Security Overview</h2>
        <p>
          Our comprehensive security framework protects your data across all platforms including LeadSite.AI, LeadSite.IO, ClientContact.IO, VideoSite.AI, and TackleAI. We employ enterprise-grade security measures, continuous monitoring, and proactive threat detection to ensure your information remains secure.
        </p>
      </section>

      <section>
        <h2>Infrastructure Security</h2>
        
        <h3>Cloud Infrastructure</h3>
        <ul>
          <li><strong>Primary Hosting:</strong> Secure cloud infrastructure powered by Railway</li>
          <li><strong>Database Security:</strong> PostgreSQL databases with encryption at rest and in transit</li>
          <li><strong>Geographic Distribution:</strong> Multi-region deployment for redundancy and performance</li>
          <li><strong>Uptime Commitment:</strong> 99.9% availability with automated failover systems</li>
        </ul>

        <h3>Network Security</h3>
        <ul>
          <li><strong>Encryption:</strong> TLS 1.3 encryption for all data in transit</li>
          <li><strong>Firewall Protection:</strong> Advanced firewall rules and intrusion detection systems</li>
          <li><strong>DDoS Protection:</strong> Distributed denial-of-service attack mitigation</li>
          <li><strong>VPN Access:</strong> Secure virtual private network for administrative access</li>
        </ul>

        <h3>Data Encryption</h3>
        <ul>
          <li><strong>At Rest:</strong> AES-256 encryption for all stored data</li>
          <li><strong>In Transit:</strong> TLS 1.3 encryption for all data transmission</li>
          <li><strong>Key Management:</strong> Hardware Security Modules (HSM) for encryption key protection</li>
          <li><strong>Database Encryption:</strong> Transparent data encryption for PostgreSQL databases</li>
        </ul>
      </section>

      <section>
        <h2>AI Security Framework</h2>
        
        <h3>AI Agent Protection</h3>
        <p>Our 7-agent AI system powered by Claude 4.1 Sonnet includes dedicated security measures:</p>
        <ul>
          <li><strong>Healing Sentinel Agent:</strong> 24/7 automated security monitoring and threat response</li>
          <li><strong>Compliance Guardian:</strong> Continuous regulatory compliance monitoring</li>
          <li><strong>Secure AI Processing:</strong> Isolated processing environments for AI workloads</li>
          <li><strong>Model Security:</strong> Regular updates and security patches for AI models</li>
        </ul>

        <h3>Data Processing Security</h3>
        <ul>
          <li><strong>Isolation:</strong> AI processing occurs in secure, isolated environments</li>
          <li><strong>Access Controls:</strong> Strict permissions for AI data access</li>
          <li><strong>Audit Trails:</strong> Complete logging of all AI processing activities</li>
          <li><strong>Data Minimization:</strong> AI processes only necessary data for specific tasks</li>
        </ul>
      </section>

      <section>
        <h2>Access Control and Authentication</h2>
        
        <h3>Multi-Factor Authentication (MFA)</h3>
        <ul>
          <li><strong>Mandatory MFA:</strong> Required for all user accounts across all platforms</li>
          <li><strong>Authentication Methods:</strong> SMS, email, authenticator apps, and hardware tokens</li>
          <li><strong>Administrative Access:</strong> Enhanced authentication requirements for admin users</li>
          <li><strong>API Security:</strong> Token-based authentication with rate limiting</li>
        </ul>

        <h3>Role-Based Access Control (RBAC)</h3>
        <ul>
          <li><strong>Principle of Least Privilege:</strong> Users receive minimum necessary permissions</li>
          <li><strong>Role Segmentation:</strong> Distinct permission levels for different user types</li>
          <li><strong>Regular Access Reviews:</strong> Quarterly audits of user permissions</li>
          <li><strong>Automated Deprovisioning:</strong> Immediate access removal upon account termination</li>
        </ul>

        <h3>Session Management</h3>
        <ul>
          <li><strong>Secure Session Tokens:</strong> Cryptographically secure session identifiers</li>
          <li><strong>Session Timeout:</strong> Automatic logout after periods of inactivity</li>
          <li><strong>Concurrent Session Limits:</strong> Restrictions on simultaneous login sessions</li>
          <li><strong>Device Tracking:</strong> Monitoring and alerts for unusual device access</li>
        </ul>
      </section>

      <section>
        <h2>Data Protection and Privacy</h2>
        
        <h3>Data Classification</h3>
        <ul>
          <li><strong>Sensitive Data:</strong> Lead information, customer data, payment details</li>
          <li><strong>Confidential Data:</strong> Business strategies, campaign data, analytics</li>
          <li><strong>Internal Data:</strong> System logs, operational metrics, security events</li>
          <li><strong>Public Data:</strong> Marketing materials, public-facing content</li>
        </ul>

        <h3>Data Handling Procedures</h3>
        <ul>
          <li><strong>Data Loss Prevention:</strong> Automated detection and prevention of data exfiltration</li>
          <li><strong>Secure Data Transfer:</strong> Encrypted channels for all data movement</li>
          <li><strong>Data Retention:</strong> Automated lifecycle management with secure deletion</li>
          <li><strong>Backup Security:</strong> Encrypted backups with secure storage and recovery procedures</li>
        </ul>

        <h3>Compliance and Governance</h3>
        <ul>
          <li><strong>GDPR Compliance:</strong> Full compliance with European data protection regulations</li>
          <li><strong>CCPA Compliance:</strong> California Consumer Privacy Act compliance measures</li>
          <li><strong>SOC 2:</strong> Service Organization Control 2 framework implementation</li>
          <li><strong>Regular Audits:</strong> Third-party security assessments and penetration testing</li>
        </ul>
      </section>

      <section>
        <h2>Monitoring and Incident Response</h2>
        
        <h3>Continuous Monitoring</h3>
        <ul>
          <li><strong>24/7 Security Operations:</strong> Around-the-clock monitoring by our Healing Sentinel AI</li>
          <li><strong>Real-Time Alerts:</strong> Immediate notification of security events and anomalies</li>
          <li><strong>Threat Intelligence:</strong> Integration with global threat intelligence feeds</li>
          <li><strong>Behavioral Analysis:</strong> AI-powered detection of unusual user and system behavior</li>
        </ul>

        <h3>Incident Response Process</h3>
        <ol>
          <li><strong>Detection:</strong> Automated and manual identification of security incidents</li>
          <li><strong>Assessment:</strong> Rapid evaluation of incident scope and impact</li>
          <li><strong>Containment:</strong> Immediate measures to prevent incident escalation</li>
          <li><strong>Investigation:</strong> Thorough analysis to determine root cause and affected systems</li>
          <li><strong>Recovery:</strong> Systematic restoration of normal operations</li>
          <li><strong>Communication:</strong> Transparent communication with affected users and stakeholders</li>
        </ol>

        <h3>Security Event Management</h3>
        <ul>
          <li><strong>Incident Classification:</strong> Severity-based categorization of security events</li>
          <li><strong>Response Team:</strong> Dedicated security incident response team</li>
          <li><strong>External Coordination:</strong> Collaboration with law enforcement when necessary</li>
          <li><strong>Post-Incident Review:</strong> Comprehensive analysis and improvement recommendations</li>
        </ul>
      </section>

      <section>
        <h2>Vulnerability Management</h2>
        
        <h3>Security Testing</h3>
        <ul>
          <li><strong>Penetration Testing:</strong> Regular external security assessments</li>
          <li><strong>Vulnerability Scanning:</strong> Automated scanning for system vulnerabilities</li>
          <li><strong>Code Reviews:</strong> Security-focused review of all code changes</li>
          <li><strong>Dependency Monitoring:</strong> Continuous monitoring of third-party dependencies</li>
        </ul>

        <h3>Patch Management</h3>
        <ul>
          <li><strong>Automated Updates:</strong> Regular security patches and system updates</li>
          <li><strong>Emergency Patching:</strong> Rapid deployment of critical security fixes</li>
          <li><strong>Change Management:</strong> Structured process for security-related changes</li>
          <li><strong>Rollback Procedures:</strong> Quick rollback capabilities for problematic updates</li>
        </ul>
      </section>

      <section>
        <h2>Employee Security</h2>
        
        <h3>Security Training</h3>
        <ul>
          <li><strong>Security Awareness:</strong> Regular training on security best practices</li>
          <li><strong>Phishing Prevention:</strong> Simulated phishing exercises and education</li>
          <li><strong>Incident Response:</strong> Training on security incident identification and reporting</li>
          <li><strong>Compliance Training:</strong> Regular updates on regulatory requirements</li>
        </ul>

        <h3>Access Management</h3>
        <ul>
          <li><strong>Background Checks:</strong> Security clearance for employees with system access</li>
          <li><strong>Onboarding Security:</strong> Security orientation for new employees</li>
          <li><strong>Access Reviews:</strong> Regular review and validation of employee access</li>
          <li><strong>Offboarding:</strong> Immediate access revocation upon employee departure</li>
        </ul>
      </section>

      <section>
        <h2>Third-Party Security</h2>
        
        <h3>Vendor Management</h3>
        <ul>
          <li><strong>Security Assessments:</strong> Comprehensive security evaluation of all vendors</li>
          <li><strong>Contractual Requirements:</strong> Security and privacy requirements in all vendor contracts</li>
          <li><strong>Ongoing Monitoring:</strong> Continuous assessment of vendor security posture</li>
          <li><strong>Incident Coordination:</strong> Collaborative incident response with key vendors</li>
        </ul>

        <h3>Integration Security</h3>
        <ul>
          <li><strong>API Security:</strong> Secure integration with third-party services and platforms</li>
          <li><strong>Data Sharing Agreements:</strong> Clear terms for data sharing with partners</li>
          <li><strong>Encryption Requirements:</strong> Mandatory encryption for all third-party data exchange</li>
          <li><strong>Access Limitations:</strong> Restricted access to only necessary data and systems</li>
        </ul>
      </section>

      <section>
        <h2>Communication Security</h2>
        
        <h3>Email Security</h3>
        <ul>
          <li><strong>SPF/DKIM/DMARC:</strong> Email authentication and anti-spoofing measures</li>
          <li><strong>Encryption:</strong> End-to-end encryption for sensitive email communications</li>
          <li><strong>Phishing Protection:</strong> Advanced threat protection for inbound emails</li>
          <li><strong>Secure Channels:</strong> Dedicated secure channels for sensitive communications</li>
        </ul>

        <h3>Platform Communications</h3>
        <ul>
          <li><strong>Channel Encryption:</strong> Secure communication across all supported platforms</li>
          <li><strong>Message Authentication:</strong> Verification of message integrity and origin</li>
          <li><strong>Rate Limiting:</strong> Protection against communication abuse and spam</li>
          <li><strong>Content Filtering:</strong> Automated detection of malicious or inappropriate content</li>
        </ul>
      </section>

      <section>
        <h2>Compliance and Certifications</h2>
        
        <h3>Regulatory Compliance</h3>
        <ul>
          <li><strong>GDPR:</strong> European Union General Data Protection Regulation</li>
          <li><strong>CCPA:</strong> California Consumer Privacy Act</li>
          <li><strong>CAN-SPAM:</strong> Email marketing compliance</li>
          <li><strong>TCPA:</strong> Telephone Consumer Protection Act</li>
          <li><strong>CASL:</strong> Canada's Anti-Spam Legislation</li>
        </ul>

        <h3>Security Standards</h3>
        <ul>
          <li><strong>SOC 2 Type II:</strong> Service Organization Control framework</li>
          <li><strong>ISO 27001:</strong> Information Security Management System</li>
          <li><strong>PCI DSS:</strong> Payment Card Industry Data Security Standard (for payment processing)</li>
          <li><strong>OWASP:</strong> Open Web Application Security Project best practices</li>
        </ul>
      </section>

      <section>
        <h2>Security Reporting</h2>
        
        <h3>Vulnerability Disclosure</h3>
        <p>We welcome responsible disclosure of security vulnerabilities:</p>
        <div className="bg-[#050505] border border-white/10 rounded-lg p-6 not-prose mt-4">
          <p className="text-sm text-neutral-400">
            <strong className="text-white">Security Email:</strong> <a href="mailto:security@aileadstrategies.com" className="text-purple-400 hover:text-purple-300">security@aileadstrategies.com</a>
          </p>
          <p className="text-sm text-neutral-400 mt-1">
            <strong className="text-white">Response Time:</strong> 24-48 hours for initial response
          </p>
          <p className="text-sm text-neutral-400 mt-1">
            <strong className="text-white">Resolution Time:</strong> 30-90 days depending on vulnerability severity
          </p>
        </div>

        <h3>Transparency Reports</h3>
        <ul>
          <li><strong>Quarterly Security Updates:</strong> Regular reports on security posture and incidents</li>
          <li><strong>Compliance Reports:</strong> Annual compliance assessment summaries</li>
          <li><strong>Incident Disclosures:</strong> Transparent communication about security incidents affecting users</li>
        </ul>
      </section>

      <section>
        <h2>Contact Information</h2>
        
        <h3>Security Team</h3>
        <div className="bg-[#050505] border border-white/10 rounded-lg p-6 not-prose">
          <p className="text-sm text-neutral-400">
            <strong className="text-white">Security Officer:</strong> <a href="mailto:security@aileadstrategies.com" className="text-purple-400 hover:text-purple-300">security@aileadstrategies.com</a>
          </p>
          <p className="text-sm text-neutral-400 mt-1">
            <strong className="text-white">Incident Response:</strong> <a href="mailto:incident@aileadstrategies.com" className="text-purple-400 hover:text-purple-300">incident@aileadstrategies.com</a>
          </p>
          <p className="text-sm text-neutral-400 mt-1">
            <strong className="text-white">Compliance Questions:</strong> <a href="mailto:compliance@aileadstrategies.com" className="text-purple-400 hover:text-purple-300">compliance@aileadstrategies.com</a>
          </p>
        </div>

        <h3>General Contact</h3>
        <div className="bg-[#050505] border border-white/10 rounded-lg p-6 not-prose mt-4">
          <p className="font-semibold text-white mb-2">AI Lead Strategies LLC</p>
          <p className="text-sm text-neutral-400">600 Eagleview Blvd, Suite 317</p>
          <p className="text-sm text-neutral-400">Exton, PA 19341</p>
          <p className="text-sm text-neutral-400 mt-2">
            Phone: <a href="tel:6107571587" className="text-purple-400 hover:text-purple-300">610.757.1587</a>
          </p>
        </div>
      </section>

      <p className="text-sm text-neutral-500 italic mt-8">
        Your security is our priority. We continuously evolve our security measures to address emerging threats and maintain the highest standards of protection for your data and business operations.
      </p>
    </LegalPageLayout>
  )
}
