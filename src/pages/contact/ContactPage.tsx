import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ContactPage = () => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => setFormState('success'), 1500);
  };

  return (
    <div className="page-shell page-stack">
      <section className="hero-panel overflow-hidden">
        <div className="grid gap-8 px-6 py-10 md:px-10 md:py-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-5">
            <p className="eyebrow">Contact Us</p>
            <h1 className="page-title">Let's talk about your next order.</h1>
            <p className="section-copy">Whether you need help with sizing, delivery, or a product inquiry, the Nuhafrik team is available to assist.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: MapPin, title: 'Location', copy: 'Kubwa, Abuja, Nigeria' },
              { icon: Phone, title: 'Phone', copy: '+234 802 373 6786' },
              { icon: Clock, title: 'Hours', copy: 'Mon-Sat, 9am-6pm' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="surface-card p-5">
                  <span className="icon-pill">
                    <Icon size={18} />
                  </span>
                  <h2 className="mt-4 text-base font-semibold text-[var(--color-text-primary)]">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{item.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card-dark p-8 md:p-10">
          <p className="eyebrow">Direct Contact</p>
          <div className="mt-8 space-y-6">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-1 text-[var(--color-primary)]" />
              <div>
                <p className="text-sm font-semibold">Our Store</p>
                <p className="mt-1 text-sm text-[rgba(255,250,242,0.72)]">Nuhafrik Store, Kubwa, Abuja, Nigeria</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={18} className="mt-1 text-[var(--color-primary)]" />
              <div>
                <p className="text-sm font-semibold">Phone</p>
                <p className="mt-1 text-sm text-[rgba(255,250,242,0.72)]">+234 802 373 6786</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={18} className="mt-1 text-[var(--color-primary)]" />
              <div>
                <p className="text-sm font-semibold">Email</p>
                <p className="mt-1 text-sm text-[rgba(255,250,242,0.72)]">hello@nuhafrik.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card p-8 md:p-10">
          <AnimatePresence mode="wait">
            {formState === 'success' ? (
              <motion.div key="success" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[26rem] flex-col items-center justify-center text-center">
                <span className="icon-pill h-20 w-20">
                  <CheckCircle2 size={34} />
                </span>
                <h2 className="mt-6 text-3xl font-bold text-[var(--color-text-primary)]">Message sent.</h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-[var(--color-text-secondary)]">
                  Thank you for reaching out. We've received your message and will get back to you within 24 hours.
                </p>
                <button onClick={() => setFormState('idle')} className="mt-6 text-sm font-semibold text-[var(--color-primary)] underline">
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <p className="eyebrow">Send a Message</p>
                  <h2 className="mt-3 text-3xl font-bold text-[var(--color-text-primary)]">We're listening.</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="field-group">
                    <input required type="text" placeholder=" " className="field" />
                    <label className="field-label">Full Name</label>
                  </div>
                  <div className="field-group">
                    <input required type="email" placeholder=" " className="field" />
                    <label className="field-label">Email Address</label>
                  </div>
                </div>
                <div className="field-group">
                  <select className="field appearance-none">
                    <option>General Inquiry</option>
                    <option>Order Support</option>
                    <option>Returns & Exchanges</option>
                    <option>Wholesale</option>
                  </select>
                </div>
                <div className="field-group">
                  <textarea required rows={5} placeholder=" " className="field min-h-36 resize-none pt-6" />
                  <label className="field-label">Your Message</label>
                </div>
                <Button type="submit" disabled={formState === 'submitting'} size="lg" className="w-full">
                  {formState === 'submitting' ? 'Sending...' : 'Send Message'}
                  {formState !== 'submitting' ? <Send size={18} /> : null}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};
