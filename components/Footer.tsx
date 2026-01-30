import Link from 'next/link';

/** AETHER-style footer with detailed legal, compliance, and social links. */
export default function Footer() {
  const legalLinks = [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/security', label: 'Security' },
    { href: '/ccpa', label: 'CCPA' },
    { href: '/gdpr', label: 'GDPR' },
    { href: '/cookies', label: 'Cookie Policy' },
    { href: '/data-processing', label: 'Data Processing' },
  ];

  const socialLinks = [
    { href: '#', label: 'Twitter' },
    { href: '#', label: 'GitHub' },
    { href: '#', label: 'Discord' },
    { href: '/terms', label: 'Legal' },
  ];

  return (
    <footer className="relative z-10 border-t border-white/5 bg-black py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Brand + primary links */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full" />
              <span className="text-sm font-medium tracking-widest uppercase text-white">
                AI Lead Strategies
              </span>
            </div>
            <p className="text-xs text-neutral-500 max-w-sm">
              One platform, infinite revenue. Automated B2B marketing ecosystem.
            </p>
          </div>

          {/* Detailed legal & compliance links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-neutral-400">
            {legalLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider + copyright + social */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-widest text-neutral-500">
          <p>© {new Date().getFullYear()} AI Lead Strategies LLC. All systems nominal.</p>
          <div className="flex gap-6">
            {socialLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
