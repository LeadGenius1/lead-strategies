# Pricing Audit — February 2026

## CONFIRMED PRICING (source of truth)

| Platform | Tiers | Prices |
|----------|-------|--------|
| LeadSite.AI | Starter, Professional, Business | $49, $149, $349 (NO Enterprise/$799) |
| LeadSite.IO | Starter, Professional, Business | $49, $149, $349 (NO Enterprise/$799) |
| ClientContact.IO | Starter, Professional, Business | $99, $149, $399 (NO Enterprise/$799) |
| UltraLead | Single tier | $499/mo |
| VideoSite.AI | FREE | $0 (no change) |
| Managed Email Pool | Add-on | $49/mo (no change) |

---

## Files to change (main project root only)

### lib/pricing-config.js
| Line | Current | Change |
|------|---------|--------|
| 46-57 | Enterprise tier (price: 799) | REMOVE entire Enterprise tier from leadsite_ai |
| 119-134 | Enterprise tier (price: 799) | REMOVE entire Enterprise tier from leadsite_io |
| 139-195 | clientcontact: Starter 49, Business 349, Enterprise 799 | Starter 49→99, Business 349→399, REMOVE Enterprise |

### app/leadsite-ai/page.js
| Line | Current | Change |
|------|---------|--------|
| 514 | grid-cols-4 | grid-cols-3 |
| 571-590 | Enterprise tier ($799, Contact Sales) | REMOVE entire Enterprise div |

### app/leadsite-io/page.js
| Line | Current | Change |
|------|---------|--------|
| 581 | grid-cols-4 | grid-cols-3 |
| 637-655 | Enterprise tier ($799, Contact Sales) | REMOVE entire Enterprise div |

### app/clientcontact-io/page.js
| Line | Current | Change |
|------|---------|--------|
| 352 | grid-cols-4 | grid-cols-3 |
| 357 | $49 (Starter) | $99 |
| 394 | $349 (Business) | $399 |
| 408-426 | Enterprise tier ($799, Contact Sales) | REMOVE entire Enterprise div |

### app/ultralead/page.js
| Line | Current | Change |
|------|---------|--------|
| 15 | $99/mo | $499/mo |
| 31 | $99/mo | $499/mo |
| 137 | $99 | $499 |

### app/page.js
| Line | Current | Change |
|------|---------|--------|
| 47 | ClientContact $79–$299 | ClientContact $99–$399 (3 tiers) |
| 74 | ClientContact $99–$299 | ClientContact $99–$399 |
| 349 | $79 (ClientContact card) | $99 |
| 368 | $99 (UltraLead card) | $499 |

### app/pricing/page.js
| Line | Current | Change |
|------|---------|--------|
| 28 | ClientContact price: '$79' | '$99' |
| 37 | UltraLead price: '$99' | '$499' |

### app/(auth)/signup/page.js
| Line | Current | Change |
|------|---------|--------|
| 12 | ClientContact price: '$79/mo' | '$99/mo' |
| 13 | UltraLead price: '$99/mo' | '$499/mo' |

### app/layout.js
| Line | Current | Change |
|------|---------|--------|
| 167 | ClientContact $99-$299/mo | ClientContact $99-$399/mo |

### lib/seo-config.js
| Line | Current | Change |
|------|---------|--------|
| 126 | ClientContact $79/mo | $99/mo |
| 146 | Only $79/mo | Only $99/mo |
| 248 | ClientContact $99-$299/mo | ClientContact $99-$399/mo |
| 254 | ClientContact $79/month | $99/month |

### components/Navigation.js
| Line | Current | Change |
|------|---------|--------|
| 10 | ClientContact price: '$79/mo' | '$99/mo' |
| 11 | UltraLead price: '$99/mo' | '$499/mo' |

### app/terms/page.js
| Line | Current | Change |
|------|---------|--------|
| 73 | ClientContact $79/month | $99/month |
| (add) | — | Add UltraLead $499/month if not present |

### app/privacy/page.js
| Line | Current | Change |
|------|---------|--------|
| 65 | $49-$99/month | $49-$499/month (reflect UltraLead $499) |

### app/clientcontact-io/page.js (FAQ schema)
| Line | Current | Change |
|------|---------|--------|
| 33 | Plans from $99/mo | Plans from $99/mo (already correct) |

---

## Files NOT to change

- **backend/** — Do not modify
- **prisma/** — Do not modify
- **OneDrive/**, **Downloads/** — Alternate/legacy copies, skip
- **components/profile/EmailTierSelector.tsx** — $49 Email Pool, keep as is
- **STRIPE_POOL_SETUP.md**, **TWO_TIER_EMAIL_DELIVERY_AUDIT.md** — Doc refs to $49 pool, keep
- **lib/websiteTemplates.ts** — Generic template pricing, not platform-specific
- **app/videosite-ai/page.js** — VideoSite.AI FREE, no change
