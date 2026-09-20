import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, ExternalLink, Send, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { api } from '../services/api';

interface ContactPageProps {
  navigate: (path: string) => void;
}

export function ContactPage({ navigate }: ContactPageProps) {
  const { settings } = useSettings();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.submitContactForm({ name, email, phone, message });
      setSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Contact & Store Counter</h1>
        <p className="text-xs text-slate-500">
          Have an urgent component inquiry, bulk college lab quotation, or question about pinout compatibility? Reach out to us directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Store Details (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
            Visit Our Store Counter
          </h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Physical Address</div>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{settings.address}</p>
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-cyan-800 font-bold hover:underline mt-1.5"
                >
                  <span>Get Driving Directions on Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Store Hours</div>
                <p className="text-slate-600 mt-0.5">{settings.openingHours}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Phone Support</div>
                <p className="text-slate-600 mt-0.5">
                  <a href={`tel:${settings.phone}`} className="hover:text-cyan-800 font-semibold">
                    {settings.phone}
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Instant WhatsApp Desk</div>
                <p className="text-slate-600 mt-0.5">
                  <a
                    href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    Chat on WhatsApp ({settings.whatsappNumber})
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Message Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
            Send Us an Inquiry
          </h2>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Thank you! Your message has been received by our store counter. We will respond promptly.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@college.edu"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700">Phone / WhatsApp Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700">Inquiry Message *</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mention component names, quantity needed, or college lab requirements..."
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold flex items-center space-x-2 transition-all shadow-xs active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Transmitting...' : 'Send Inquiry'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
