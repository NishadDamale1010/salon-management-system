import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { cmsService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { SALON_WHATSAPP } from "../../constants";

export default function Contact() {
  const { data } = useQuery({ queryKey: QUERY_KEYS.SETTINGS, queryFn: cmsService.getSettings });
  const settings = data?.data;
  const contact = settings?.contact || {};
  const hours = settings?.businessHours || {};
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pt-8 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4">Contact <span className="text-gradient-rose">Us</span></motion.h1>
          <p className="text-[var(--color-text-muted)]">We'd love to hear from you</p>
        </div>
        <div className="max-w-2xl mx-auto space-y-5">
            {[
              { icon: Phone, label: "Phone", value: contact.phone || "8830383499", href: `tel:${contact.phone || "8830383499"}` },
              { icon: Mail, label: "Email", value: contact.email || "gayatribeautystudio@gmail.com", href: `mailto:${contact.email || "gayatribeautystudio@gmail.com"}` },
              { icon: MessageCircle, label: "WhatsApp", value: contact.whatsapp || "8830383499", href: `https://wa.me/91${SALON_WHATSAPP}` },
              { icon: MapPin, label: "Address", value: contact.address },
            ].map(({ icon: Icon, label, value, href }) => value ? (
              <div key={label} className="flex gap-4 p-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-[var(--shadow-card)]">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-rose-500)]/10 flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-[var(--color-rose-400)]" /></div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
                  {href ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-primary)] hover:text-[var(--color-rose-400)] transition-colors">{value}</a> : <p className="text-[var(--color-text-primary)]">{value}</p>}
                </div>
              </div>
            ) : null)}
            <div className="p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-4"><Clock className="w-4 h-4 text-[var(--color-rose-400)]" /><h3 className="font-semibold text-[var(--color-text-primary)]">Business Hours</h3></div>
              <div className="space-y-2">
                {days.map(day => {
                  const h = hours[day];
                  return h ? <div key={day} className="flex justify-between text-sm"><span className="capitalize text-[var(--color-text-secondary)]">{day}</span><span className={h.isOpen ? "text-[var(--color-text-primary)]" : "text-red-400"}>{h.isOpen ? `${h.openTime} – ${h.closeTime}` : "Closed"}</span></div> : null;
                })}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
