'use client';

import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
}

interface AetherFooterProps {
  companyName?: string;
  links?: FooterLink[];
  socialLinks?: FooterLink[];
}

export default function AetherFooter({
  companyName = 'AI Lead Strategies',
  links,
  socialLinks,
}: AetherFooterProps) {
  const defaultLinks: FooterLink[] = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Support', href: '/support' },
  ];

  const defaultSocialLinks: FooterLink[] = [
    { label: 'Twitter', href: '#' },
    { label: 'LinkedIn', href: '#' },
    { label: 'GitHub', href: '#' },
  ];

  const footerLinks = links || defaultLinks;
  const footerSocialLinks = socialLinks || defaultSocialLinks;

  return (
    <footer className="footer-aether">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        {/* Logo & Copyright */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-4 h-4 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full transition-transform group-hover:scale-110"></div>
            <span className="text-sm font-medium tracking-widest uppercase text-white">{companyName}</span>
          </Link>
          <p className="text-xs text-neutral-500">© {new Date().getFullYear()} {companyName}. All systems nominal.</p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-8">
          {footerLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="footer-link-aether"
            >
              {link.label}
            </Link>
          ))}
          {footerSocialLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              className="footer-link-aether"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
