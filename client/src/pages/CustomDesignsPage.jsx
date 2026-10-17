import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  CheckCircle,
  Clock,
  Shield,
  Send,
  HelpCircle,
  FileCheck,
  Info
} from 'lucide-react';
import apiFetch from '../utils/api.js';

const CustomDesignsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    productType: 'Pendant Light',
    material: 'Natural River Bamboo',
    finish: 'Natural Matt Linen Oil',
    dimensions: '',
    budgetRange: '৳3,500 - ৳6,000',
    referenceImage: '',
    instructions: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const body = new FormData();
    body.append('image', file);

    try {
      const res = await apiFetch('/upload', {
        method: 'POST',
        body
      });
      if (res.success && res.fileUrl) {
        setFormData(prev => ({ ...prev, referenceImage: res.fileUrl }));
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await apiFetch('/custom-designs', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success && res.inquiry) {
        setSubmittedInquiry(res.inquiry);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit inquiry. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-10 sm:py-16 space-y-12">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sand-200 text-bamboo font-semibold text-xs uppercase tracking-widest">
          <Sparkles size={14} />
          <span>Bespoke Atelier</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-walnut">
          Custom Lighting & Personalization
        </h1>
        <p className="text-sm sm:text-base text-sand-500 leading-relaxed max-w-2xl mx-auto">
          Commission a custom bamboo or wooden lighting fixture tailored to your ceiling height, room dimensions, or architectural concept. Every commission is handcrafted by master artisans in Sylhet.
        </p>
      </div>

      {submittedInquiry ? (
        /* Success Screen */
        <div className="bg-sand-50 border border-sand-300 rounded-3xl p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-6 shadow-md animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-olive-100 text-olive-600 flex items-center justify-center mx-auto">
            <CheckCircle size={36} />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-walnut">
              Inquiry Received Successfully
            </h2>
            <p className="text-xs sm:text-sm text-sand-500 max-w-md mx-auto">
              Thank you, <strong>{submittedInquiry.name}</strong>. Our senior lighting consultant has received your custom commission request.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-sand-200 inline-block text-left text-xs space-y-1">
            <p><strong className="text-walnut">Inquiry Reference ID:</strong> <span className="font-mono text-bamboo font-bold">{submittedInquiry.inquiryNumber}</span></p>
            <p><strong className="text-walnut">Fixture Type:</strong> {submittedInquiry.productType}</p>
            <p><strong className="text-walnut">Material:</strong> {submittedInquiry.material}</p>
            <p><strong className="text-walnut">Estimated Turnaround:</strong> 5 to 10 days for design & hand-weaving</p>
          </div>

          <p className="text-xs text-sand-400">
            We will review your spatial requirements and contact you at <strong>{submittedInquiry.phone}</strong> with a detailed sketch and official quotation.
          </p>

          <button
            onClick={() => {
              setSubmittedInquiry(null);
              setFormData({
                name: '',
                phone: '',
                email: '',
                productType: 'Pendant Light',
                material: 'Natural River Bamboo',
                finish: 'Natural Matt Linen Oil',
                dimensions: '',
                budgetRange: '৳3,500 - ৳6,000',
                referenceImage: '',
                instructions: ''
              });
            }}
            className="px-6 py-2.5 bg-walnut text-cream text-xs font-semibold rounded hover:bg-walnut-700 transition-colors"
          >
            Submit Another Inquiry
          </button>
        </div>
      ) : (
        /* The Inquiry Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Col: Form */}
          <div className="lg:col-span-8 bg-cream p-6 sm:p-10 lg:p-12 rounded-3xl border border-sand-300 shadow-card space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Notice Box */}
              <div className="p-4 bg-sand-100 rounded-xl border border-sand-200 text-xs text-walnut-700 flex items-start gap-3">
                <Info size={18} className="text-bamboo flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Custom Order Notice:</strong> Custom designs require artisan feasibility review, production scheduling (typically 7-14 days), and a personalized quotation before crafting begins.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  {errorMsg}
                </div>
              )}

              {/* 1. Fixture Type & Materials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-walnut mb-1.5">
                    1. Fixture Type *
                  </label>
                  <select
                    name="productType"
                    value={formData.productType}
                    onChange={handleChange}
                    className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                  >
                    <option value="Pendant Light">Hanging Pendant Light</option>
                    <option value="Table Lamp">Artisanal Table Lamp</option>
                    <option value="Floor Lamp">Sculptural Floor Lamp</option>
                    <option value="Wall Sconce">Ambient Wall Sconce</option>
                    <option value="Chandelier">Multi-Light Chandelier</option>
                    <option value="Decorative Accent">Decorative Room Accent</option>
                    <option value="Other">Other Bespoke Requirement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-walnut mb-1.5">
                    2. Primary Material *
                  </label>
                  <select
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                  >
                    <option value="Natural River Bamboo">Natural River Bamboo (Blonde)</option>
                    <option value="Smoked Dark Bamboo">Smoked Dark Walnut Bamboo</option>
                    <option value="Seasoned Teak Wood">Seasoned Chittagong Teak Wood</option>
                    <option value="Cane / Rattan Weave">Natural Cane / Rattan Weave</option>
                    <option value="Combination">Mixed Timber & Bamboo Composite</option>
                  </select>
                </div>
              </div>

              {/* 2. Finish & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-walnut mb-1.5">
                    3. Desired Finish
                  </label>
                  <select
                    name="finish"
                    value={formData.finish}
                    onChange={handleChange}
                    className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                  >
                    <option value="Natural Matt Linen Oil">Natural Matt Linen Oil (Satin touch)</option>
                    <option value="Honey Warm Gloss">Honey Warm Organic Shellac</option>
                    <option value="Smoked Dark Walnut">Smoked Espresso Charred</option>
                    <option value="Raw Organic">Raw Unsealed Bamboo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-walnut mb-1.5">
                    4. Budget Range (BDT)
                  </label>
                  <select
                    name="budgetRange"
                    value={formData.budgetRange}
                    onChange={handleChange}
                    className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                  >
                    <option value="৳2,500 - ৳5,000">৳2,500 - ৳5,000 (Small/Table)</option>
                    <option value="৳5,000 - ৳8,500">৳5,000 - ৳8,500 (Pendant/Medium)</option>
                    <option value="৳8,500 - ৳15,000">৳8,500 - ৳15,000 (Grand/Floor Lamp)</option>
                    <option value="৳15,000+">৳15,000+ (Chandelier / Commercial)</option>
                  </select>
                </div>
              </div>

              {/* 3. Dimensions & Spatial notes */}
              <div>
                <label className="block text-xs font-bold text-walnut mb-1.5">
                  5. Approximate Dimensions or Room Details
                </label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  placeholder="e.g., Height 22 inches, Diameter 18 inches, Ceiling height 10 ft"
                  className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                />
              </div>

              {/* 4. Reference Image Upload */}
              <div>
                <label className="block text-xs font-bold text-walnut mb-1.5">
                  6. Upload Reference Sketch or Photo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-sand-200 hover:bg-sand-300 text-walnut text-xs font-semibold rounded cursor-pointer transition-colors">
                    <Upload size={14} />
                    <span>{uploadingImage ? 'Uploading...' : 'Choose File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.referenceImage && (
                    <div className="flex items-center gap-2 text-xs text-olive-600 font-medium">
                      <CheckCircle size={14} />
                      <span>Image attached</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Detailed Instructions */}
              <div>
                <label className="block text-xs font-bold text-walnut mb-1.5">
                  7. Design Specifications & Special Instructions *
                </label>
                <textarea
                  name="instructions"
                  required
                  rows={4}
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Describe your design preference, lighting warmth, cord length, or any architectural motifs you'd like woven into your piece..."
                  className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                />
              </div>

              {/* 6. Contact Details */}
              <div className="pt-4 border-t border-sand-200 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-walnut">
                  Your Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-walnut mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Asif Mahmud"
                      className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-walnut mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="017XXXXXXXX"
                      className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-walnut mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="asif@example.com"
                      className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-walnut hover:bg-walnut-700 text-cream font-semibold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
              >
                <Send size={15} />
                <span>{submitting ? 'Submitting Inquiry...' : 'Submit Custom Order Inquiry'}</span>
              </button>
            </form>
          </div>

          {/* Right Col: Timeline & Process */}
          <div className="lg:col-span-4 space-y-6 sticky top-28">
            <div className="p-8 bg-sand-100 rounded-3xl border border-sand-300 space-y-6">
              <h3 className="font-display text-xl font-bold text-walnut">
                The Commission Journey
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-bamboo text-charcoal font-bold flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-walnut">Consultation & Sketch</h4>
                    <p className="text-sand-500 mt-0.5">We discuss dimensions, spatial photos, and provide a 2D craft blueprint with exact pricing.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-bamboo text-charcoal font-bold flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-walnut">Material Selection</h4>
                    <p className="text-sand-500 mt-0.5">We select prime, dry-seasoned bamboo and hardwood blocks matching your color tone.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-bamboo text-charcoal font-bold flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-walnut">Artisan Weaving</h4>
                    <p className="text-sand-500 mt-0.5">Master weavers spend 30-50 hours shaping, heat-treating, and intertwining your piece.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-bamboo text-charcoal font-bold flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-walnut">Electrical Testing & Safe Delivery</h4>
                    <p className="text-sand-500 mt-0.5">Certified insulation testing, wooden crate packaging, and insured doorstep delivery.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-cream rounded-2xl border border-sand-200 space-y-3 text-xs">
              <h4 className="font-bold text-walnut">Need Instant Advice?</h4>
              <p className="text-sand-500">
                You can also message our craft concierge directly via WhatsApp with sketches, floor plans, or mood boards.
              </p>
              <a
                href="https://wa.me/8801712345678"
                target="_blank"
                rel="noreferrer"
                className="inline-block font-semibold text-bamboo hover:underline"
              >
                Chat on WhatsApp (+880 1712-345678) →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDesignsPage;
