import { Link } from 'react-router-dom';
import {
  FiArrowUpRight,
  FiClock,
  FiFacebook,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiPhone,
  FiTwitter,
  FiYoutube,
} from 'react-icons/fi';
import Logo from './Logo';

const exploreLinks = [
  { to: '/cars', label: 'All Cars' },
  { to: '/cars?condition=New', label: 'New Arrivals' },
  { to: '/cars?condition=Used', label: 'Used Cars' },
  { to: '/finance', label: 'Finance Calculator' },
  { to: '/track', label: 'Track Booking' },
];

const socials = [
  { icon: FiInstagram, label: 'Instagram', href: 'https://www.instagram.com' },
  { icon: FiFacebook, label: 'Facebook', href: 'https://www.facebook.com' },
  { icon: FiTwitter, label: 'X / Twitter', href: 'https://www.x.com' },
  { icon: FiYoutube, label: 'YouTube', href: 'https://www.youtube.com' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink text-white">
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-racing/10 blur-[110px]" />
      <div className="container-page relative py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.7fr_0.9fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/45">
              A premium showroom experience for new and pre-owned cars. Curated
              inventory, transparent pricing and a booking journey built around you.
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/50 transition hover:border-racing hover:bg-racing hover:text-white"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">Explore</h3>
            <ul className="mt-5 space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="group inline-flex items-center gap-1.5 text-sm text-white/60 transition hover:text-white">
                    {link.label}
                    <FiArrowUpRight size={12} className="opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">Visit Showroom</h3>
            <ul className="mt-5 space-y-4 text-sm text-white/55">
              <li className="flex gap-3">
                <FiMapPin size={16} className="mt-0.5 shrink-0 text-racing" />
                <span>Motora Flagship Showroom,<br />Main Boulevard, Gulberg III,<br />Lahore, Pakistan</span>
              </li>
              <li>
                <a href="tel:+924211122233" className="flex items-center gap-3 transition hover:text-white">
                  <FiPhone size={15} className="shrink-0 text-racing" />
                  +92 42 111 222 33
                </a>
              </li>
              <li>
                <a href="mailto:hello@motora.demo" className="flex items-center gap-3 transition hover:text-white">
                  <FiMail size={15} className="shrink-0 text-racing" />
                  hello@motora.demo
                </a>
              </li>
              <li className="flex gap-3">
                <FiClock size={16} className="mt-0.5 shrink-0 text-racing" />
                <span>Mon – Sat: 10:00 AM – 8:00 PM<br />Sunday: 12:00 PM – 6:00 PM</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">Find Us</h3>
            <div className="relative mt-5 h-44 overflow-hidden rounded-card border border-white/10 bg-carbon">
              <div className="absolute inset-0 bg-grid opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-racing/10" />
              <div className="absolute left-[22%] top-[28%] h-[2px] w-32 rotate-[18deg] bg-white/10" />
              <div className="absolute bottom-[30%] left-0 right-0 h-[2px] bg-white/10" />
              <div className="absolute right-[18%] top-0 bottom-0 w-[2px] bg-white/10" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="relative mx-auto grid h-11 w-11 place-items-center rounded-full bg-racing text-white shadow-[0_0_0_8px_rgba(225,6,0,0.14)]">
                  <FiMapPin size={18} />
                </span>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  Motora Showroom
                </p>
              </div>
              <span className="absolute bottom-3 left-3 rounded-full bg-ink/80 px-2.5 py-1 text-[9px] uppercase tracking-wider text-white/40 backdrop-blur">
                Map placeholder
              </span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-white/30">
              Directions are illustrative for this demo experience.
            </p>
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-gold/15 bg-gold/[0.05] px-5 py-4">
          <p className="text-[11px] leading-relaxed text-white/45">
            <span className="font-semibold text-gold">Demo website.</span>{' '}
            Motora Car Dealers is a frontend-only demo. All vehicles, bookings, payments,
            enquiries and confirmations are simulated and stored in your browser. No real
            transaction, email or SMS is processed.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.08] pt-7 text-[11px] text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Motora Car Dealers. Demo project — all rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/admin/login" className="transition hover:text-white/70">Demo Admin</Link>
            <span className="hidden h-3 w-px bg-white/10 sm:block" />
            <p>Built for demonstration purposes.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
