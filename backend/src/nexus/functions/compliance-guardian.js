// NEXUS Function #9: Compliance Guardian
// Validates email compliance for CAN-SPAM, GDPR, and domain reputation
const dns = require('dns');
const { promisify } = require('util');

const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);

// Common disposable email domains
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'dispostable.com', 'trashmail.com', 'fakeinbox.com', 'tempail.com',
  'temp-mail.org', '10minutemail.com', 'getnada.com', 'mohmal.com',
  'maildrop.cc', 'discard.email', 'mailnesia.com', 'mintemail.com'
]);

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validate an email address (format, MX records, disposable domain check)
 */
async function validateEmail(email) {
  try {
    if (!email || typeof email !== 'string') {
      return { valid: false, reason: 'Email is required and must be a string' };
    }

    const trimmed = email.trim().toLowerCase();

    // Format check
    if (!EMAIL_REGEX.test(trimmed)) {
      return { valid: false, reason: 'Invalid email format' };
    }

    const domain = trimmed.split('@')[1];

    // Disposable domain check
    if (DISPOSABLE_DOMAINS.has(domain)) {
      return { valid: false, reason: `Disposable email domain: ${domain}` };
    }

    // MX record check
    try {
      const mxRecords = await resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return { valid: false, reason: `No MX records found for domain: ${domain}` };
      }
    } catch (err) {
      return { valid: false, reason: `DNS lookup failed for domain: ${domain} (${err.code || err.message})` };
    }

    return { valid: true, email: trimmed, domain };
  } catch (error) {
    return { valid: false, reason: `Validation error: ${error.message}` };
  }
}

/**
 * Check CAN-SPAM compliance for email content
 */
function canSpamCheck({ subject, body, senderName, physicalAddress }) {
  try {
    const violations = [];

    if (!subject || subject.trim().length === 0) {
      violations.push('Missing subject line');
    }

    if (!body || body.trim().length === 0) {
      violations.push('Missing email body');
    }

    if (!senderName || senderName.trim().length === 0) {
      violations.push('Missing sender name (required by CAN-SPAM)');
    }

    if (!physicalAddress || physicalAddress.trim().length === 0) {
      violations.push('Missing physical mailing address (required by CAN-SPAM)');
    }

    // Check for unsubscribe link in body
    if (body) {
      const lowerBody = body.toLowerCase();
      const hasUnsubscribe = lowerBody.includes('unsubscribe') ||
        lowerBody.includes('opt-out') ||
        lowerBody.includes('opt out') ||
        lowerBody.includes('manage preferences');
      if (!hasUnsubscribe) {
        violations.push('No unsubscribe/opt-out link found in email body');
      }
    }

    // Check for deceptive subject line patterns
    if (subject) {
      const deceptivePatterns = [/^re:/i, /^fw:/i, /^fwd:/i];
      for (const pattern of deceptivePatterns) {
        if (pattern.test(subject.trim())) {
          violations.push('Subject line appears deceptive (fake Re:/Fw: prefix)');
          break;
        }
      }
    }

    return {
      compliant: violations.length === 0,
      violations,
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    return { compliant: false, violations: [`Check error: ${error.message}`], checkedAt: new Date().toISOString() };
  }
}

/**
 * Check GDPR compliance for a recipient
 */
function gdprCheck({ country, hasConsent, consentTimestamp }) {
  try {
    const EU_COUNTRIES = new Set([
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
      'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
      'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
      // EEA
      'IS', 'LI', 'NO',
      // UK post-Brexit still has similar rules
      'GB'
    ]);

    const countryCode = (country || '').toUpperCase().trim();
    const isEU = EU_COUNTRIES.has(countryCode);

    if (!isEU) {
      return { compliant: true, reason: 'Recipient not in EU/EEA/UK — GDPR does not apply' };
    }

    if (!hasConsent) {
      return { compliant: false, reason: 'GDPR requires explicit consent for EU/EEA/UK recipients' };
    }

    if (!consentTimestamp) {
      return { compliant: false, reason: 'GDPR requires a recorded consent timestamp' };
    }

    const consentDate = new Date(consentTimestamp);
    if (isNaN(consentDate.getTime())) {
      return { compliant: false, reason: 'Invalid consent timestamp format' };
    }

    return {
      compliant: true,
      reason: `Consent recorded on ${consentDate.toISOString()}`,
      consentAge: Math.floor((Date.now() - consentDate.getTime()) / (1000 * 60 * 60 * 24)) + ' days'
    };
  } catch (error) {
    return { compliant: false, reason: `GDPR check error: ${error.message}` };
  }
}

/**
 * Validate domain DNS records (SPF, DKIM, DMARC)
 */
async function validateDomain(domain) {
  try {
    if (!domain || typeof domain !== 'string') {
      return { valid: false, reason: 'Domain is required' };
    }

    const results = { domain, records: {} };

    // SPF check
    try {
      const txtRecords = await resolveTxt(domain);
      const spfRecord = txtRecords.flat().find(r => r.startsWith('v=spf1'));
      results.records.spf = spfRecord
        ? { found: true, record: spfRecord }
        : { found: false, recommendation: 'Add an SPF record to your DNS' };
    } catch (err) {
      results.records.spf = { found: false, error: err.code || err.message };
    }

    // DMARC check
    try {
      const dmarcRecords = await resolveTxt(`_dmarc.${domain}`);
      const dmarcRecord = dmarcRecords.flat().find(r => r.startsWith('v=DMARC1'));
      results.records.dmarc = dmarcRecord
        ? { found: true, record: dmarcRecord }
        : { found: false, recommendation: 'Add a DMARC record to _dmarc.' + domain };
    } catch (err) {
      results.records.dmarc = { found: false, error: err.code || err.message };
    }

    // DKIM check (common selectors)
    const dkimSelectors = ['default', 'google', 'selector1', 'selector2', 'k1', 'mail'];
    results.records.dkim = { found: false, selectorsChecked: [] };

    for (const selector of dkimSelectors) {
      try {
        const dkimRecords = await resolveTxt(`${selector}._domainkey.${domain}`);
        const dkimRecord = dkimRecords.flat().find(r => r.includes('DKIM1') || r.includes('p='));
        if (dkimRecord) {
          results.records.dkim = { found: true, selector, record: dkimRecord.substring(0, 100) + '...' };
          break;
        }
      } catch (err) {
        results.records.dkim.selectorsChecked.push(selector);
      }
    }

    if (!results.records.dkim.found) {
      results.records.dkim.recommendation = 'Configure DKIM signing for your domain';
    }

    // MX check
    try {
      const mxRecords = await resolveMx(domain);
      results.records.mx = {
        found: mxRecords.length > 0,
        records: mxRecords.slice(0, 5).map(r => ({ exchange: r.exchange, priority: r.priority }))
      };
    } catch (err) {
      results.records.mx = { found: false, error: err.code || err.message };
    }

    const allFound = results.records.spf.found && results.records.dkim.found && results.records.dmarc.found;
    results.valid = allFound;
    results.score = [results.records.spf.found, results.records.dkim.found, results.records.dmarc.found, results.records.mx.found]
      .filter(Boolean).length * 25;

    return results;
  } catch (error) {
    return { valid: false, reason: `Domain validation error: ${error.message}` };
  }
}

/**
 * NEXUS function handler — dispatches compliance_check actions
 */
async function complianceCheck(params) {
  const { action, payload } = params;

  switch (action) {
    case 'validate_email':
      return await validateEmail(payload.email);
    case 'can_spam_check':
      return canSpamCheck(payload);
    case 'gdpr_check':
      return gdprCheck(payload);
    case 'validate_domain':
      return await validateDomain(payload.domain);
    default:
      return { error: `Unknown compliance action: ${action}` };
  }
}

module.exports = {
  validateEmail,
  canSpamCheck,
  gdprCheck,
  validateDomain,
  complianceCheck
};
