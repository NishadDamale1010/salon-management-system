import { Link } from "react-router-dom";
import { Sparkles, Camera, Globe, Video, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { SALON_NAME, SALON_TAGLINE, SALON_WHATSAPP, SALON_INSTAGRAM, SALON_FACEBOOK } from "../../constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-[var(--color-surface-2)] border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-rose-500)] to-[var(--color-rose-700)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[var(--color-text-primary)]" />
              </div>
              <span className="font-display font-bold text-[var(--color-text-primary)]">{SALON_NAME}</span>
            </div>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6 max-w-xs">
              {SALON_TAGLINE}. Premium beauty treatments with certified professionals.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Camera, href: SALON_INSTAGRAM, label: "Instagram" },
                { icon: Globe, href: SALON_FACEBOOK, label: "Facebook" },
                { icon: Video, href: "#", label: "YouTube" },
                {
                  icon: MessageCircle,
                  href: `https://wa.me/91${SALON_WHATSAPP}`,
                  label: "WhatsApp",
                },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-[var(--color-rose-500)]/5 hover:bg-[var(--color-rose-500)]/20 border border-[var(--color-rose-500)]/10 hover:border-[var(--color-rose-500)]/30 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-rose-400)] transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: "/services", label: "Services" },
                { to: "/products", label: "Shop Products" },
                { to: "/gallery", label: "Gallery" },
                { to: "/offers", label: "Offers" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
                { to: "/register", label: "Book Appointment" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-rose-400)] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-4 text-sm">Get In Touch</h4>
            <ul className="space-y-3">
              <li className="flex gap-2 text-sm text-[var(--color-text-muted)]">
                <Phone className="w-4 h-4 text-[var(--color-rose-400)] flex-shrink-0 mt-0.5" />
                <span>+91 8830383499</span>
              </li>
              <li className="flex gap-2 text-sm text-[var(--color-text-muted)]">
                <Mail className="w-4 h-4 text-[var(--color-rose-400)] flex-shrink-0 mt-0.5" />
                <span>gayatribeautystudio@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            © {currentYear} {SALON_NAME}. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-[var(--color-text-muted)]">
            <a href="#" className="hover:text-[var(--color-rose-400)] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--color-rose-400)] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
