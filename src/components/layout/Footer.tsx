import Link from 'next/link'
import { Mail, Heart } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { label: 'Browse Sequences', href: '/browse' },
        { label: 'Become a Seller', href: '/become-seller' },
        { label: 'How It Works', href: '/#how-it-works' },
        { label: 'Pricing', href: '/#pricing' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', href: '/legal/terms-of-service' },
        { label: 'Privacy Policy', href: '/legal/privacy-policy' },
        { label: 'Community Guidelines', href: '/legal/community-guidelines' },
        { label: 'Seller Agreement', href: '/legal/seller-agreement' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/support' },
        { label: 'Contact Us', href: 'mailto:support@sequencehub.com' },
        { label: 'Report an Issue', href: 'mailto:abuse@sequencehub.com' },
        { label: 'FAQs', href: '/support#faqs' },
      ],
    },
    {
      title: 'Community',
      links: [
        { label: 'Blog', href: '/blog' },
        { label: 'Tutorials', href: '/tutorials' },
        { label: 'Forums', href: '/forums' },
        { label: 'Showcase', href: '/showcase' },
      ],
    },
  ]

  return (
    <footer className="bg-background border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('mailto:') ? (
                      <a
                        href={link.href}
                        className="text-sm text-white/60 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-white/60 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <div className="max-w-md">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Stay Updated
            </h3>
            <p className="text-sm text-white/60 mb-4">
              Get the latest news, sequences, and updates delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              />
              <button className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/80 text-white font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>&copy; {currentYear} SequenceHub Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            <span>for the xLights community</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="mailto:legal@sequencehub.com"
              className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Legal Inquiries
            </a>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-white/40 text-center max-w-4xl mx-auto">
            <strong>Important:</strong> Sellers are solely responsible for ensuring they have
            the necessary rights and licenses for music and content in their sequences.
            SequenceHub is a marketplace platform and does not provide legal advice. Please
            consult with legal counsel regarding your obligations.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
