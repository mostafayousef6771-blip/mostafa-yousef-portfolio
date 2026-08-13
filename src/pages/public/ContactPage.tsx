import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Globe,
  MapPin,
  Phone,
  MessageCircle,
  Github,
  Linkedin,
  ArrowUpRight,
} from 'lucide-react';
import { SocialLink, Profile } from '../../types/portfolio';
import { repository } from '../../lib/repository';
import { PageTransition } from '../../components/ui/PageTransition';
import { ScrollReveal } from '../../components/ui/ScrollReveal';

interface ContactPageProps {
  socialLinks: SocialLink[];
  profile: Profile | null;
  onMessageSent?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ socialLinks, profile, onMessageSent }) => {
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const enabledSocials = socialLinks.filter((s) => s.is_enabled);

  const getSocialIcon = (platform: string, label: string) => {
    const combined = `${platform} ${label}`.toLowerCase();
    if (combined.includes('github')) return <Github className="w-4 h-4 text-[#F1EEE7]" />;
    if (combined.includes('linkedin')) return <Linkedin className="w-4 h-4 text-[#C69A5B]" />;
    if (combined.includes('whatsapp')) return <MessageCircle className="w-4 h-4 text-[#C69A5B]" />;
    if (combined.includes('email') || combined.includes('mail')) return <Mail className="w-4 h-4 text-[#C69A5B]" />;
    if (combined.includes('phone') || combined.includes('call') || combined.includes('tel'))
      return <Phone className="w-4 h-4 text-[#C69A5B]" />;
    return <Globe className="w-4 h-4 text-[#C69A5B]" />;
  };

  const whatsappLink = enabledSocials.find(
    (s) => s.platform === 'WhatsApp' || s.label.toLowerCase().includes('whatsapp')
  );
  const emailLink = enabledSocials.find(
    (s) => s.platform === 'Email' || s.label.toLowerCase().includes('email')
  );
  const phoneLink = enabledSocials.find(
    (s) => s.platform === 'Phone' || s.label.toLowerCase().includes('phone')
  );

  const validateForm = () => {
    if (!formData.sender_name.trim()) {
      setErrorMessage('Please enter your full name.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.sender_email.trim() || !emailRegex.test(formData.sender_email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }

    if (!formData.message.trim() || formData.message.trim().length < 5) {
      setErrorMessage('Please enter a message of at least 5 characters.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      await repository.sendMessage({
        sender_name: formData.sender_name.trim(),
        sender_email: formData.sender_email.trim(),
        subject: formData.subject.trim() || 'Portfolio Contact Form Submission',
        message: formData.message.trim(),
      });

      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).catch(() => {});

      setStatus('success');
      setFormData({ sender_name: '', sender_email: '', subject: '', message: '' });
      onMessageSent?.();
    } catch (err) {
      console.error('Submit contact form error:', err);
      setStatus('error');
      setErrorMessage('An error occurred while sending your message. Please try again.');
    }
  };

  return (
    <PageTransition className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 space-y-12">
      {/* Editorial Header */}
      <div>
        <span className="text-xs font-mono text-[#C69A5B] tracking-widest uppercase block mb-3">
          DIRECT CORRESPONDENCE
        </span>
        <h1 className="font-serif text-4xl sm:text-7xl font-light text-[#F1EEE7] mb-4 break-words">
          Get In Touch
        </h1>
        <p className="text-[#9B9991] text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
          Send a direct message regarding engineering consulting, leadership opportunities, or technical inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Form Column */}
        <ScrollReveal className="lg:col-span-7 space-y-8">
          <div className="p-8 bg-[#131310] border border-[#23231F] rounded-sm space-y-6">
            <h2 className="font-serif text-2xl text-[#F1EEE7] border-b border-[#23231F] pb-4">
              Send a Message
            </h2>

            {status === 'success' && (
              <div className="p-4 bg-[#0B0B09] border border-[#C69A5B]/40 text-[#F1EEE7] text-xs font-mono flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#C69A5B] shrink-0" />
                <span>Message delivered successfully. I will respond promptly.</span>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 bg-[#0B0B09] border border-rose-900/50 text-rose-300 text-xs font-mono flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono text-[#9B9991] uppercase tracking-wider mb-2">
                    Full Name <span className="text-[#C69A5B]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.sender_name}
                    onChange={(e) => {
                      setFormData({ ...formData, sender_name: e.target.value });
                      if (status === 'error') setStatus('idle');
                    }}
                    className="w-full bg-[#0B0B09] border border-[#23231F] rounded-sm px-4 py-3 min-h-[44px] text-sm sm:text-xs text-[#F1EEE7] placeholder:text-[#9B9991]/50 focus:outline-none focus:border-[#C69A5B] transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#9B9991] uppercase tracking-wider mb-2">
                    Email Address <span className="text-[#C69A5B]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sarah@example.com"
                    value={formData.sender_email}
                    onChange={(e) => {
                      setFormData({ ...formData, sender_email: e.target.value });
                      if (status === 'error') setStatus('idle');
                    }}
                    className="w-full bg-[#0B0B09] border border-[#23231F] rounded-sm px-4 py-3 min-h-[44px] text-sm sm:text-xs text-[#F1EEE7] placeholder:text-[#9B9991]/50 focus:outline-none focus:border-[#C69A5B] transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#9B9991] uppercase tracking-wider mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. System Architecture Consulting"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#0B0B09] border border-[#23231F] rounded-sm px-4 py-3 min-h-[44px] text-sm sm:text-xs text-[#F1EEE7] placeholder:text-[#9B9991]/50 focus:outline-none focus:border-[#C69A5B] transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#9B9991] uppercase tracking-wider mb-2">
                  Message <span className="text-[#C69A5B]">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Describe project details, scope, or inquiries..."
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (status === 'error') setStatus('idle');
                  }}
                  className="w-full bg-[#0B0B09] border border-[#23231F] rounded-sm p-4 text-sm sm:text-xs text-[#F1EEE7] placeholder:text-[#9B9991]/50 focus:outline-none focus:border-[#C69A5B] transition-colors resize-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-4 min-h-[48px] bg-[#F1EEE7] hover:bg-[#C69A5B] text-[#0B0B09] text-xs font-mono uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2 rounded-sm"
              >
                <span>{status === 'submitting' ? 'TRANSMITTING...' : 'SEND CORRESPONDENCE'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </ScrollReveal>

        {/* Contact Info & Social Channels */}
        <ScrollReveal delay={0.15} className="lg:col-span-5 space-y-8">
          {/* Location & Quick Actions */}
          {(whatsappLink || emailLink || phoneLink || profile?.location) && (
            <div className="p-8 bg-[#131310] border border-[#23231F] rounded-sm space-y-6">
              <h2 className="font-serif text-2xl text-[#F1EEE7] border-b border-[#23231F] pb-4">
                Direct Channels
              </h2>

              {profile?.location && (
                <div className="flex items-center gap-3 text-xs font-mono text-[#9B9991] pb-4 border-b border-[#23231F]">
                  <MapPin className="w-4 h-4 text-[#C69A5B] shrink-0" />
                  <div>
                    <span className="text-[#9B9991]/60 text-[10px] block uppercase tracking-wider">LOCATION</span>
                    <span className="text-[#F1EEE7]">{profile.location}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {whatsappLink && (
                  <a
                    href={
                      whatsappLink.url.startsWith('http')
                        ? whatsappLink.url
                        : `https://wa.me/${whatsappLink.url.replace(/[^0-9]/g, '')}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-[#0B0B09] border border-[#23231F] hover:border-[#C69A5B] text-xs font-mono text-[#F1EEE7] uppercase tracking-wider transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-4 h-4 text-[#C69A5B]" />
                      <span>WhatsApp Message</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#9B9991] group-hover:text-[#C69A5B] transition-colors" />
                  </a>
                )}

                {emailLink && (
                  <a
                    href={emailLink.url.startsWith('mailto:') ? emailLink.url : `mailto:${emailLink.url}`}
                    className="flex items-center justify-between p-4 bg-[#0B0B09] border border-[#23231F] hover:border-[#C69A5B] text-xs font-mono text-[#F1EEE7] uppercase tracking-wider transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-[#C69A5B]" />
                      <span>Direct Email</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#9B9991] group-hover:text-[#C69A5B] transition-colors" />
                  </a>
                )}

                {phoneLink && (
                  <a
                    href={phoneLink.url.startsWith('tel:') ? phoneLink.url : `tel:${phoneLink.url}`}
                    className="flex items-center justify-between p-4 bg-[#0B0B09] border border-[#23231F] hover:border-[#C69A5B] text-xs font-mono text-[#F1EEE7] uppercase tracking-wider transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-[#C69A5B]" />
                      <span>Phone Call</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#9B9991] group-hover:text-[#C69A5B] transition-colors" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="p-8 bg-[#131310] border border-[#23231F] rounded-sm space-y-6">
            <h2 className="font-serif text-2xl text-[#F1EEE7] border-b border-[#23231F] pb-4">
              Digital Presence
            </h2>

            {enabledSocials.length > 0 ? (
              <div className="space-y-3">
                {enabledSocials.map((social) => (
                  <a
                    key={social.id}
                    href={
                      social.platform === 'Email' && !social.url.startsWith('mailto:')
                        ? `mailto:${social.url}`
                        : social.platform === 'Phone' && !social.url.startsWith('tel:')
                        ? `tel:${social.url}`
                        : social.url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-[#0B0B09] border border-[#23231F] hover:border-[#C69A5B] flex items-center justify-between text-xs font-mono text-[#F1EEE7] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {getSocialIcon(social.platform, social.label)}
                      <span className="uppercase tracking-wider">{social.label || social.platform}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#9B9991] group-hover:text-[#C69A5B] transition-colors" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-[#9B9991]">
                Social channels will appear here once enabled in the Admin Dashboard.
              </p>
            )}
          </div>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
};
