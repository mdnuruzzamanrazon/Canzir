import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Shield, Heart, Sparkles } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="space-y-20 sm:space-y-28 py-10 sm:py-16">
      {/* 1. Header Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs uppercase tracking-widest font-semibold text-bamboo">
          Artisan Manifesto
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-walnut leading-tight">
          Born from Earth. Sculpted by Hands. Alive with Light.
        </h1>
        <p className="text-xs sm:text-base text-sand-500 max-w-2xl mx-auto leading-relaxed">
          Canzir was founded on a simple revelation: in a world flooded with synthetic plastic lamps and cold LED fixtures, true serenity comes when we bring nature’s warmth back into our living rooms.
        </p>
      </section>

      {/* 2. Visual Storytelling Section */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6 text-sm sm:text-base text-sand-500 leading-relaxed font-normal">
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-walnut">
              The Heritage of Bengal Bamboo Weaving
            </h2>
            <p>
              For centuries, the riverine landscape of Bangladesh has cultivated one of the finest, most pliable bamboo varieties in the world. Yet in modern times, plastic and machine-stamped metal dominated architectural interior lighting.
            </p>
            <p>
              Canzir unites generational master artisans from rural Sylhet and Comilla with contemporary minimalist Scandinavian and Japandi aesthetics. Each lighting fixture is not mass-produced in a factory; it is shaped by an artisan who knows the tension, flex, and spirit of natural bamboo.
            </p>
            <div className="p-5 bg-sand-100 rounded-2xl border border-sand-200 text-walnut font-serif italic text-base">
              "We don't manufacture lamps. We preserve the shadow and the warmth of the living tree."
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-3xl overflow-hidden shadow-lg aspect-[3/4] bg-sand-200">
              <img
                src="/assets/products/bamboo-lattice-table-lamp.jpeg"
                alt="Handcrafted bamboo lamp"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-3xl overflow-hidden shadow-lg aspect-[3/4] bg-sand-200 mt-10">
              <img
                src="/assets/craftsmanship/artisan-workshop.jpeg"
                alt="Artisan weaving workshop"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 4 Canzir Principles */}
      <section className="bg-sand-100 py-20 sm:py-28 border-y border-sand-200">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest font-semibold text-bamboo">
              Our Ethos
            </span>
            <h2 className="font-display text-3xl font-bold text-walnut mt-1">
              Guiding Craft Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-cream rounded-2xl border border-sand-200 shadow-sm space-y-3">
              <div className="p-3 bg-walnut text-cream rounded-lg w-fit">
                <Leaf size={20} />
              </div>
              <h3 className="font-display text-lg font-bold text-walnut">100% Sustainable Bamboo</h3>
              <p className="text-xs text-sand-500 leading-relaxed">
                Bamboo is one of the fastest growing grasses on earth. Our harvesting cycle encourages root growth without causing deforestation.
              </p>
            </div>

            <div className="p-6 bg-cream rounded-2xl border border-sand-200 shadow-sm space-y-3">
              <div className="p-3 bg-walnut text-cream rounded-lg w-fit">
                <Heart size={20} />
              </div>
              <h3 className="font-display text-lg font-bold text-walnut">Ethical Artisan Wages</h3>
              <p className="text-xs text-sand-500 leading-relaxed">
                We pay 2.5x standard regional handicraft wages, supporting artisan families and safeguarding intangible cultural heritage.
              </p>
            </div>

            <div className="p-6 bg-cream rounded-2xl border border-sand-200 shadow-sm space-y-3">
              <div className="p-3 bg-walnut text-cream rounded-lg w-fit">
                <Sparkles size={20} />
              </div>
              <h3 className="font-display text-lg font-bold text-walnut">Organic Finishes</h3>
              <p className="text-xs text-sand-500 leading-relaxed">
                Zero harmful lacquers. Finished solely with cold-pressed natural linseed oils and organic beeswax to preserve breathability.
              </p>
            </div>

            <div className="p-6 bg-cream rounded-2xl border border-sand-200 shadow-sm space-y-3">
              <div className="p-3 bg-walnut text-cream rounded-lg w-fit">
                <Shield size={20} />
              </div>
              <h3 className="font-display text-lg font-bold text-walnut">Modern Safety Certified</h3>
              <p className="text-xs text-sand-500 leading-relaxed">
                Every fixture incorporates heavy-gauge copper wiring, CE/UL certified flame-retardant lamp holders, and tested thermal dissipation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-walnut">
          Ready to Bring Nature’s Warmth Home?
        </h2>
        <p className="text-xs sm:text-sm text-sand-500 max-w-md mx-auto">
          Explore our collection of limited-edition lighting sculptures or request a custom architectural design.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            to="/shop"
            className="px-8 py-3.5 bg-walnut hover:bg-walnut-700 text-cream font-semibold rounded text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
          >
            <span>Explore The Collection</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/custom-designs"
            className="px-8 py-3.5 border border-walnut text-walnut hover:bg-sand-200 font-semibold rounded text-xs uppercase tracking-wider transition-colors"
          >
            <span>Custom Commissions</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
