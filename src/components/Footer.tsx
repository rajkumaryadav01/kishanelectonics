import { Cpu, Phone, MessageSquare, MapPin, Clock, Mail, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface FooterProps {
  navigate: (path: string) => void;
}

export function Footer({ navigate }: FooterProps) {
  const { settings } = useSettings();

  const quickCategories = [
    { name: 'Integrated Circuits (ICs)', path: '/products?category=cat_ics' },
    { name: 'Sensors & Transducers', path: '/products?category=cat_sensors' },
    { name: 'Microcontrollers & Dev Boards', path: '/products?category=cat_arduino' },
    { name: 'Wireless & IoT Modules', path: '/products?category=cat_esp32' },
    { name: 'Motors & Actuators', path: '/products?category=cat_motors' },
    { name: 'Power Supplies & Batteries', path: '/products?category=cat_power' },
    { name: 'Breadboards & Jumpers', path: '/products?category=cat_breadboards' },
    { name: 'Project Starter Kits', path: '/project-kits' },
  ];

  const helpfulLinks = [
    { label: 'All Products Catalogue', path: '/products' },
    { label: 'Component Categories', path: '/categories' },
    { label: 'Build My Project (ECE Tool)', path: '/build-my-project' },
    { label: 'Compare Components', path: '/compare' },
    { label: 'Track My Order', path: '/profile' },
    { label: 'About Kishan Electronics', path: '/about' },
    { label: 'Contact & Shop Location', path: '/contact' },
    { label: 'Store Admin Portal', path: '/admin' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 pt-14 pb-8 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Brand & Store Bio */}
          <div className="space-y-4">
            <div
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                {settings.shopName}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your premier offline and online electronics components hub. Dedicated to supplying engineering
              students, hardware makers, and industrial R&D teams with 100% genuine ICs, microcontrollers,
              sensors, and verified project kits.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-400 hover:bg-emerald-900/60 text-xs font-semibold transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Enquiry</span>
              </a>
              <a
                href={`tel:${settings.phone}`}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Counter</span>
              </a>
            </div>
          </div>

          {/* Column 2: Popular Categories */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">
              Component Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {quickCategories.map((cat) => (
                <li key={cat.name}>
                  <button
                    onClick={() => navigate(cat.path)}
                    className="hover:text-cyan-400 transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">
              Store & Customer Service
            </h4>
            <ul className="space-y-2 text-xs">
              {helpfulLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="hover:text-cyan-400 transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Physical Shop Visit Info */}
          <div className="space-y-3 text-xs">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">
              Physical Shop Location
            </h4>
            <div className="flex items-start space-x-2 text-slate-300">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
            <div className="flex items-start space-x-2 text-slate-300">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{settings.openingHours}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{settings.email}</span>
            </div>
            <div className="pt-2">
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-emerald-400">
              <div className="font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pickup Counter Ready</span>
              </div>
              <p className="text-slate-400 text-[10px] mt-0.5">
                Place order online, pick up directly from store without waiting in queue!
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} {settings.shopName}. All Rights Reserved. Complete ECE Hardware Solution.
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/about')} className="hover:text-slate-400">
              Privacy & Guarantee
            </button>
            <span>•</span>
            <button onClick={() => navigate('/contact')} className="hover:text-slate-400">
              Store Support
            </button>
            <span>•</span>
            <button onClick={() => navigate('/admin')} className="text-slate-600 hover:text-amber-400">
              Admin Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
