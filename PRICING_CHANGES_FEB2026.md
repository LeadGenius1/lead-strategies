# Pricing Changes — February 2026

## Summary of All Changes Applied

**Date:** February 2026  
**Checkpoint:** ac5620f0 / tag checkpoint-email-tables-created  
**Scope:** Pricing text/numbers only — no backend, auth, CORS, middleware, schema, or functionality changes.

---

## Confirmed Pricing (February 2026)

| Platform | Tiers | Prices |
|----------|-------|--------|
| LeadSite.AI | Starter, Professional, Business | $49, $149, $349 |
| LeadSite.IO | Starter, Professional, Business | $49, $149, $349 |
| ClientContact.IO | Starter, Professional, Business | $99, $149, $399 |
| UltraLead | Single tier | $499/mo |
| VideoSite.AI | FREE | $0 (unchanged) |
| Managed Email Pool | Add-on | $49/mo (unchanged) |

**Removed:** Enterprise / $799 tier from LeadSite.AI, LeadSite.IO, and ClientContact.IO.

---

## Files Changed — Detailed List

### 1. lib/pricing-config.js
| Change | Old | New |
|--------|-----|-----|
| leadsite_ai | Enterprise tier (price: 799) | REMOVED |
| leadsite_io | Enterprise tier (price: 799) | REMOVED |
| clientcontact startingPrice | 49 | 99 |
| clientcontact Starter price | 49 | 99 |
| clientcontact Business price | 349 | 399 |
| clientcontact Enterprise tier | Entire tier | REMOVED |

### 2. app/leadsite-ai/page.js
| Line | Old | New |
|------|-----|-----|
| 515 | grid-cols-4 | grid-cols-3 |
| 571–588 | Enterprise tier div ($799, Contact Sales) | REMOVED |

### 3. app/leadsite-io/page.js
| Line | Old | New |
|------|-----|-----|
| 581 | grid-cols-4 | grid-cols-3 |
| 636–654 | Enterprise tier div ($799, Contact Sales) | REMOVED |

### 4. app/clientcontact-io/page.js
| Line | Old | New |
|------|-----|-----|
| 352 | grid-cols-4 | grid-cols-3 |
| 357 | $49/mo (Starter) | $99/mo |
| 394 | $349/mo (Business) | $399/mo |
| 407–425 | Enterprise tier div ($799, Contact Sales) | REMOVED |

### 5. app/ultralead/page.js
| Line | Old | New |
|------|-----|-----|
| 15 | $99/mo (schema description) | $499/mo |
| 20 | price: '99' | price: '499' |
| 31 | $99/mo (sr-only h1) | $499/mo |
| 137 | $99/mo (hero price) | $499/mo |

### 6. app/page.js
| Line | Old | New |
|------|-----|-----|
| 47 | ClientContact $79–$299/mo (FAQ) | $99–$399/mo; added UltraLead $499/mo |
| 74 | ClientContact $99–$299/mo (sr-only) | $99–$399/mo; added UltraLead $499/mo |
| 349 | $79 (ClientContact card) | $99 |
| 368 | $99 (UltraLead card) | $499 |

### 7. app/pricing/page.js
| Line | Old | New |
|------|-----|-----|
| 28 | ClientContact price: '$79' | '$99' |
| 37 | UltraLead price: '$99' | '$499' |

### 8. app/(auth)/signup/page.js
| Line | Old | New |
|------|-----|-----|
| 12 | ClientContact price: '$79/mo' | '$99/mo' |
| 13 | UltraLead price: '$99/mo' | '$499/mo' |

### 9. app/layout.js
| Line | Old | New |
|------|-----|-----|
| 167 | ClientContact $99-$299/mo (meta) | $99-$399/mo; added UltraLead $499/mo |

### 10. lib/seo-config.js
| Line | Old | New |
|------|-----|-----|
| 126 | title: '...$79/mo' | '...$99/mo' |
| 146 | ogDescription: 'Only $79/mo' | 'Only $99/mo' |
| 154 | price: '79' (schema) | price: '99' |
| 248 | home: ClientContact $99-$299, 4 platforms | $99-$399, 5 platforms, UltraLead $499 |
| 254 | clientcontactIO: $79/month | $99/month |

### 11. components/Navigation.js
| Line | Old | New |
|------|-----|-----|
| 10 | ClientContact price: '$79/mo' | '$99/mo' |
| 11 | UltraLead price: '$99/mo' | '$499/mo' |

### 12. app/terms/page.js
| Line | Old | New |
|------|-----|-----|
| 73 | ClientContact $79/month | $99/month |
| 74 | — | Added UltraLead $499/month |

### 13. app/privacy/page.js
| Line | Old | New |
|------|-----|-----|
| 65 | $49-$99/month (tier range) | $49-$499/month |

---

## Verification Results

- **$799:** Zero results in main project (C:\Dev\lead-strategies-build)
- **$79/mo** (ClientContact): Zero results in main project
- **UltraLead + $99:** Zero results in main project
- **ClientContact Starter + $49:** Zero results in main project

---

## Files Not Changed (per instructions)

- backend/ — No changes
- prisma/ — No changes
- VideoSite.AI — FREE pricing unchanged
- Managed Email Pool — $49/mo unchanged
- lib/websiteTemplates.ts — Generic template pricing, not platform-specific
- clientcontactCrm in pricing-config.js — Different product, unchanged
