import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const LightingQuizModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    room: '',
    mood: '',
    material: ''
  });
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelectRoom = (room) => {
    setAnswers(prev => ({ ...prev, room }));
    setStep(2);
  };

  const handleSelectMood = (mood) => {
    setAnswers(prev => ({ ...prev, mood }));
    setStep(3);
  };

  const handleSelectMaterial = (material) => {
    setAnswers(prev => ({ ...prev, material }));
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setAnswers({ room: '', mood: '', material: '' });
  };

  const handleViewMatches = () => {
    onClose();
    // Navigate to shop with appropriate query filters
    navigate(`/shop?roomType=${encodeURIComponent(answers.room)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-cream border border-sand-300 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-sand-500 hover:text-walnut rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center max-w-md mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-200 text-bamboo-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles size={13} />
            <span>Find Your Perfect Light</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-walnut">
            Curate Your Space
          </h2>
          <p className="text-xs text-sand-500 mt-1">
            Answer 3 thoughtful questions to discover the ideal handcrafted Canzir fixture for your lifestyle.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s ? 'w-8 bg-bamboo' : step > s ? 'w-4 bg-sand-400' : 'w-4 bg-sand-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Room Selection */}
        {step === 1 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-walnut text-center mb-4">
              Step 1: Which sanctuary are you illuminating?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Living Room', desc: 'Warm ambient glow for gatherings', icon: '🛋️' },
                { name: 'Bedroom', desc: 'Soft peaceful bedtime radiance', icon: '🛏️' },
                { name: 'Dining Room', desc: 'Suspended focal illumination', icon: '🍽️' },
                { name: 'Reading Nook', desc: 'Architectural accent & calm corner', icon: '📖' }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleSelectRoom(item.name)}
                  className="p-4 rounded-xl border border-sand-200 bg-white hover:border-bamboo hover:bg-sand-50 text-left transition-all group flex flex-col justify-between"
                >
                  <span className="text-2xl mb-2">{item.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-walnut group-hover:text-bamboo">{item.name}</h4>
                    <p className="text-[11px] text-sand-400 mt-0.5">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Lighting Mood */}
        {step === 2 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-walnut text-center mb-4">
              Step 2: What lighting atmosphere do you desire?
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { mood: 'Warm Ambient Glow', desc: 'Gentle, soothing amber shadows that melt away evening stress.' },
                { mood: 'Diffused Lattice', desc: 'Intricate woven diamond patterns projected across surfaces.' },
                { mood: 'Architectural Accent', desc: 'Curved sculptural silhouettes creating a biophilic art statement.' }
              ].map((item) => (
                <button
                  key={item.mood}
                  onClick={() => handleSelectMood(item.mood)}
                  className="p-4 rounded-xl border border-sand-200 bg-white hover:border-bamboo hover:bg-sand-50 text-left transition-all group"
                >
                  <h4 className="text-xs font-bold text-walnut group-hover:text-bamboo">{item.mood}</h4>
                  <p className="text-[11px] text-sand-500 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Material Preference */}
        {step === 3 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-walnut text-center mb-4">
              Step 3: What natural material speaks to you?
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { mat: 'Natural River Bamboo', desc: 'Lightweight, sustainable river grass with warm organic texture.' },
                { mat: 'Solid Teak Hardwood', desc: 'Fluted timber pillars turned by hand with rich natural grain.' },
                { mat: 'Cottage Thatch & Timber', desc: 'Nostalgic vernacular architecture with slatted bamboo.' }
              ].map((item) => (
                <button
                  key={item.mat}
                  onClick={() => handleSelectMaterial(item.mat)}
                  className="p-4 rounded-xl border border-sand-200 bg-white hover:border-bamboo hover:bg-sand-50 text-left transition-all group"
                >
                  <h4 className="text-xs font-bold text-walnut group-hover:text-bamboo">{item.mat}</h4>
                  <p className="text-[11px] text-sand-500 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Recommendation Results */}
        {step === 4 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 bg-olive-100 text-olive-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-walnut">
                We Found Your Lighting Match
              </h3>
              <p className="text-xs text-sand-500 mt-1 max-w-sm mx-auto">
                Based on your preference for <strong>{answers.room}</strong> with a{' '}
                <strong>{answers.mood}</strong> atmosphere in <strong>{answers.material}</strong>:
              </p>
            </div>

            <div className="p-4 bg-sand-100 rounded-xl border border-sand-200 text-left flex items-center gap-4">
              <img
                src="/assets/products/bamboo-lattice-table-lamp.jpeg"
                alt="Recommended Lamp"
                className="w-16 h-16 rounded-lg object-cover bg-sand-200"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-bamboo tracking-wider">Top Recommendation</span>
                <h4 className="text-sm font-semibold text-walnut">The Heritage Lattice Bamboo Table Lamp</h4>
                <p className="text-[11px] text-sand-500">Perfect amber glow casting serene shadow lattices.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleReset}
                className="py-2.5 px-4 text-xs font-medium text-walnut hover:underline"
              >
                Start Over
              </button>
              <button
                onClick={handleViewMatches}
                className="flex-1 py-3 px-6 bg-walnut hover:bg-walnut-700 text-cream rounded font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>Explore Matching Lights</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LightingQuizModal;
