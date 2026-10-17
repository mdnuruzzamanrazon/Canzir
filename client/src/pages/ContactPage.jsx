import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import apiFetch from '../utils/api.js';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Question',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'How long does shipping take across Bangladesh?',
      a: 'Orders in Dhaka City typically arrive within 24 to 48 hours. For all other districts across Bangladesh, delivery requires 3 to 5 business days via our specialized safe-handling courier partners.'
    },
    {
      q: 'Are the bamboo lamps safe with high-temperature bulbs?',
      a: 'Yes. All Canzir fixtures are specifically designed and tested with energy-efficient warm LED bulbs (included with most fixtures) that generate virtually no heat. We use certified heat-retardant socket assemblies.'
    },
    {
      q: 'How do I clean and maintain natural bamboo lighting?',
      a: 'Simply dust occasionally with a soft dry brush, feather duster, or dry microfiber cloth. Avoid damp wet cloths or harsh chemical sprays. Natural bamboo stays vibrant and ages gracefully over decades.'
    },
    {
      q: 'Can I request a custom size or chandelier for my project?',
      a: 'Absolutely! Visit our Custom Designs page to submit your spatial dimensions and concept. Our master craft consultant will provide a detailed quote and sketch within 24 hours.'
    },
    {
      q: 'What is your return or replacement policy if a fixture is damaged?',
      a: 'We offer a 100% Zero-Breakage Replacement Guarantee. If your lamp arrives with any courier damage, notify us via WhatsApp within 48 hours with a photo and we will immediately ship a brand-new fixture at zero extra charge.'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await apiFetch('/inquiries', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setSubmitted(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-10 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-bamboo">
          Concierge Support
        </span>
        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-walnut">
          We’re Here to Help
        </h1>
        <p className="text-sm sm:text-base text-sand-500 leading-relaxed max-w-xl mx-auto">
          Have an inquiry regarding fixture dimensions, custom commissions, or showroom appointments? Reach out to our concierge team.
        </p>
      </div>

      {/* Main Grid: Contact Cards + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left 5 Cols: Contact Details */}
        <div className="lg:col-span-5 space-y-6 sticky top-28">
          <div className="bg-sand-50 p-6 sm:p-8 rounded-2xl border border-sand-300 space-y-6">
            <h2 className="font-display text-xl font-bold text-walnut">
              Direct Concierge Channels
            </h2>

            <div className="space-y-4 text-xs text-walnut-700">
              <a
                href="https://wa.me/8801712345678"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 p-3 bg-white rounded-xl border border-sand-200 hover:border-bamboo transition-colors"
              >
                <div className="p-2 bg-olive-100 text-olive-700 rounded-lg">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-walnut">WhatsApp Instant Concierge</h4>
                  <p className="text-sand-500 mt-0.5">+880 1712-345678</p>
                  <span className="text-[10px] text-olive-600 font-semibold">Active now • Fast replies</span>
                </div>
              </a>

              <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-sand-200">
                <div className="p-2 bg-sand-200 text-walnut rounded-lg">
                  <Phone size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-walnut">Customer Hotline</h4>
                  <p className="text-sand-500 mt-0.5">+880 1712-345678 (10 AM - 8 PM)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-sand-200">
                <div className="p-2 bg-sand-200 text-walnut rounded-lg">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-walnut">Email Inquiries</h4>
                  <p className="text-sand-500 mt-0.5">concierge@canzir.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-sand-200">
                <div className="p-2 bg-sand-200 text-walnut rounded-lg">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-walnut">Atelier & Showroom</h4>
                  <p className="text-sand-500 mt-0.5">
                    Artisan Studio, Road 11, Banani, Dhaka 1213, Bangladesh
                  </p>
                  <p className="text-[10px] text-sand-400 mt-1">Open Sat-Thu 11am - 8pm by appointment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Working Contact Form */}
        <div className="lg:col-span-7 bg-cream p-6 sm:p-10 rounded-2xl border border-sand-300 shadow-sm space-y-6">
          <h2 className="font-display text-2xl font-bold text-walnut">
            Send an Inquiry Message
          </h2>

          {submitted ? (
            <div className="p-8 bg-sand-50 border border-sand-300 rounded-xl text-center space-y-3 animate-fade-in">
              <CheckCircle size={36} className="text-olive-600 mx-auto" />
              <h3 className="font-display text-xl font-bold text-walnut">Message Sent Successfully</h3>
              <p className="text-xs text-sand-500 max-w-sm mx-auto">
                Thank you for contacting Canzir. A lighting consultant will respond to your inquiry within 2 to 4 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', phone: '', subject: 'General Question', message: '' });
                }}
                className="mt-4 px-6 py-2 bg-walnut text-cream text-xs font-semibold rounded"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-walnut mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Mahir Faisal"
                    className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-walnut mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="mahir@example.com"
                    className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-walnut mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-walnut mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                  >
                    <option value="General Question">General Question</option>
                    <option value="Custom Lighting Consultation">Custom Lighting Consultation</option>
                    <option value="Order Tracking Help">Order Tracking Help</option>
                    <option value="Architect & Trade Inquiries">Architect & Trade Inquiries</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-walnut mb-1">Your Message *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tell us how we can assist your interior lighting needs..."
                  className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-walnut hover:bg-walnut-700 text-cream font-semibold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Send size={15} />
                <span>{submitting ? 'Sending Message...' : 'Send Inquiry Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="pt-12 border-t border-sand-300 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest font-semibold text-bamboo">FAQ</span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-walnut">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-sand-50 rounded-xl border border-sand-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-walnut hover:text-bamboo transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`transform transition-transform ${openFaq === idx ? 'rotate-180 text-bamboo' : ''}`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-sand-500 leading-relaxed border-t border-sand-200/60 pt-3 animate-fade-in font-normal">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
