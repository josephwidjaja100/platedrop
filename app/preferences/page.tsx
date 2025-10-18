"use client"

import React, { useState, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp, Users, Lightbulb, Dumbbell, Sparkles } from 'lucide-react';
import PageSelector from '../../components/PageSelector';

const PreferencesScreen = () => {
  const [preferences, setPreferences] = useState({
    matchTypes: [],
    energyLevel: 50,
    commonalities: 'flexible',
    surpriseFactor: 30
  });

  const [expandedSection, setExpandedSection] = useState(null);

  const matchTypeOptions = [
    { id: 'study', label: 'Study buddy', icon: '📚', description: 'focus sessions & library runs' },
    { id: 'gym', label: 'Gym partner', icon: '💪', description: 'workouts & fitness goals' },
    { id: 'adventure', label: 'Adventure buddy', icon: '🏔️', description: 'explore & discover' },
    { id: 'coffee', label: 'Coffee companion', icon: '☕', description: 'chill hangouts' },
    { id: 'creative', label: 'Creative partner', icon: '🎨', description: 'art & projects' },
    { id: 'conversation', label: 'Deep talk friend', icon: '💭', description: 'meaningful chats' },
    { id: 'music', label: 'Music enthusiast', icon: '🎵', description: 'concerts & jams' },
    { id: 'food', label: 'Food explorer', icon: '🍜', description: 'restaurants & cooking' },
  ];

  const toggleMatchType = (id) => {
    setPreferences(prev => ({
      ...prev,
      matchTypes: prev.matchTypes.includes(id)
        ? prev.matchTypes.filter(t => t !== id)
        : [...prev.matchTypes, id]
    }));
  };

  const PreferenceSection = ({ id, title, icon: Icon, children, description }) => {
    const isExpanded = expandedSection === id;
    return (
      <div className="profile-card backdrop-blur-md bg-white/50 rounded-xl p-4 md:p-5 border-2 border-white/70 transition-all duration-300">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : id)}
          className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <Icon size={16} className="text-gray-700" />
            <div className="text-left">
              <span className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">{title}</span>
              {description && <p className="text-xs text-gray-600 mt-0.5">{description}</p>}
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-700" />
          ) : (
            <ChevronDown size={20} className="text-gray-700" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t-2 border-white/50">
            {children}
          </div>
        )}
      </div>
    );
  };

  // Custom hook for drag functionality
  const useDragSlider = (initialValue = 50) => {
    const [value, setValue] = useState(initialValue);
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef(null);

    const updateValue = useCallback((clientX) => {
      if (!sliderRef.current) return;
      
      const rect = sliderRef.current.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(rect.width, x)); // Clamp between 0 and slider width
      const percentage = Math.round((x / rect.width) * 100);
      
      setValue(percentage);
    }, []);

    const handleMouseDown = useCallback((e) => {
      e.preventDefault();
      setIsDragging(true);
      updateValue(e.clientX);
    }, [updateValue]);

    const handleMouseMove = useCallback((e) => {
      if (!isDragging) return;
      updateValue(e.clientX);
    }, [isDragging, updateValue]);

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    const handleTouchStart = useCallback((e) => {
      setIsDragging(true);
      updateValue(e.touches[0].clientX);
    }, [updateValue]);

    const handleTouchMove = useCallback((e) => {
      if (!isDragging) return;
      updateValue(e.touches[0].clientX);
    }, [isDragging, updateValue]);

    const handleTouchEnd = useCallback(() => {
      setIsDragging(false);
    }, []);

    // Add/remove event listeners
    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
        
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('touchend', handleTouchEnd);
        };
      }
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    const SliderComponent = ({ label1, label2, feedbackTexts, onChange }) => {
      React.useEffect(() => {
        if (onChange) {
          onChange(value);
        }
      }, [value, onChange]);

      return (
        <div className="space-y-4">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>{label1}</span>
            <span className="font-bold text-gray-900">{value}%</span>
            <span>{label2}</span>
          </div>
          
          <div className="relative pt-8 pb-4">
            {/* Slider Track */}
            <div
              ref={sliderRef}
              className="relative h-2 bg-white/60 rounded-lg cursor-pointer select-none touch-none"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {/* Background Track */}
              <div className="absolute inset-0 bg-white/60 rounded-lg" />
              
              {/* Filled Track */}
              <div
                className="absolute h-full bg-gray-900 rounded-lg transition-all duration-100"
                style={{ width: `${value}%` }}
              />
              
              {/* Thumb Handle */}
              <div
                className="absolute top-1/2 w-6 h-6 bg-gray-900 border-2 border-white rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 transition-all duration-100 z-10"
                style={{ 
                  left: `${value}%`,
                  transform: `translateY(-50%) translateX(-50%) scale(${isDragging ? 1.2 : 1})`
                }}
              />
              
              {/* Enhanced click area */}
              <div className="absolute -inset-3" />
            </div>
            
            {/* Value Indicator */}
            <div
              className="absolute -top-6 text-xs font-bold text-gray-900 bg-white/90 px-2 py-1 rounded shadow-sm pointer-events-none transition-all duration-100 z-20"
              style={{
                left: `${value}%`,
                transform: 'translateX(-50%)',
                opacity: isDragging ? 1 : 0.9
              }}
            >
              {value}%
            </div>
          </div>
          
          {/* Feedback Text */}
          <p className="text-xs text-gray-600 italic mt-3 min-h-[20px]">
            {feedbackTexts[0] && value < 30 && feedbackTexts[0]}
            {feedbackTexts[1] && value >= 30 && value < 70 && feedbackTexts[1]}
            {feedbackTexts[2] && value >= 70 && feedbackTexts[2]}
          </p>
        </div>
      );
    };

    return [value, SliderComponent, setValue];
  };

  // Create individual sliders
  const [energyValue, EnergySlider] = useDragSlider(preferences.energyLevel);
  const [surpriseValue, SurpriseSlider] = useDragSlider(preferences.surpriseFactor);

  // Update preferences when sliders change
  React.useEffect(() => {
    setPreferences(prev => ({ ...prev, energyLevel: energyValue }));
  }, [energyValue]);

  React.useEffect(() => {
    setPreferences(prev => ({ ...prev, surpriseFactor: surpriseValue }));
  }, [surpriseValue]);

  const renderMatchTypeCard = (option) => {
    const isSelected = preferences.matchTypes.includes(option.id);
    return (
      <button
        key={option.id}
        onClick={() => toggleMatchType(option.id)}
        className={`
          p-3 rounded-lg border-2 transition-all duration-300 text-left
          ${isSelected 
            ? 'border-gray-900 bg-white/80 shadow-md scale-105' 
            : 'border-white/70 bg-white/40 hover:bg-white/60 hover:border-white/90'
          }
        `}
      >
        <div className="flex items-start justify-between mb-1">
          <span className="text-xl">{option.icon}</span>
          {isSelected && <Sparkles size={14} className="text-gray-900" />}
        </div>
        <p className="font-bold text-sm text-gray-900">{option.label}</p>
        <p className="text-xs text-gray-600 mt-0.5">{option.description}</p>
      </button>
    );
  };

  return (
    <>
      <link 
        href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" 
        rel="stylesheet" 
      />
      
      <div className="fixed inset-0 bg-gradient-animated overflow-hidden flex flex-col items-center justify-start p-safe safe-area-inset" style={{ fontFamily: 'Merriweather, serif' }}>
        <div className="w-full flex-1 flex flex-col items-center md:justify-center overflow-y-auto safe-scroll transition-all duration-500">
          <div className="w-full max-w-4xl mx-auto md:max-w-sm lg:max-w-lg xl:max-w-xl px-safe relative">
            {/* Minimalist PageSelector, top left, desktop only */}
            <div className="hidden md:flex flex-col items-center justify-center absolute left-0 top-0 h-full z-30">
              <PageSelector />
            </div>
            <div className="text-center mb-6 md:mb-8 mt-4 md:mt-0">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900">your preferences</h1>
              <p className="text-gray-700 mt-2 md:mt-3 text-xs md:text-base">customize your perfect plate match</p>
            </div>

            <div className="space-y-4 pb-24 md:pb-8">
              {/* Match Types */}
              <PreferenceSection 
                id="matchTypes" 
                title="what type of plate?" 
                icon={Users}
                description={preferences.matchTypes.length > 0 ? `${preferences.matchTypes.length} selected` : 'pick one or more'}
              >
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {matchTypeOptions.map(option => renderMatchTypeCard(option))}
                </div>
              </PreferenceSection>

              {/* Energy Level */}
              <PreferenceSection 
                id="energy" 
                title="energy compatibility" 
                icon={Dumbbell}
                description="how important is matching energy?"
              >
                <EnergySlider
                  label1="doesn't matter"
                  label2="must match"
                  feedbackTexts={[
                    "relaxed about matching vibes—bring what you've got!",
                    "some compatibility matters, but differences are cool too",
                    "looking for someone with similar energy to me"
                  ]}
                />
              </PreferenceSection>

              {/* Commonalities */}
              <PreferenceSection 
                id="commonalities" 
                title="what should we share?" 
                icon={Lightbulb}
                description="interests & values"
              >
                <div className="space-y-2">
                  {[
                    { value: 'flexible', label: '🎲 Surprise me', desc: 'mix of similar & different' },
                    { value: 'some', label: '🤝 Some overlap', desc: 'at least one thing in common' },
                    { value: 'similar', label: '✨ Similar vibes', desc: 'share multiple interests' },
                    { value: 'mirror', label: '🪞 Mirror match', desc: 'very similar people' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPreferences(prev => ({ ...prev, commonalities: option.value }))}
                      className={`
                        w-full p-3 rounded-lg border-2 transition-all duration-300 text-left
                        ${preferences.commonalities === option.value
                          ? 'border-gray-900 bg-white/80'
                          : 'border-white/70 bg-white/40 hover:bg-white/60'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-gray-900">{option.label}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{option.desc}</p>
                        </div>
                        {preferences.commonalities === option.value && <Sparkles size={16} className="text-gray-900" />}
                      </div>
                    </button>
                  ))}
                </div>
              </PreferenceSection>

              {/* Wildcard Factor */}
              <PreferenceSection 
                id="surprise" 
                title="wildcard factor" 
                icon={Sparkles}
                description="how adventurous are you?"
              >
                <SurpriseSlider
                  label1="play it safe"
                  label2="totally random!"
                  feedbackTexts={[
                    "you want someone who checks most of your boxes",
                    "open to some unexpected matches—you might vibe with someone different",
                    "let's mix it up! random can be magic ✨"
                  ]}
                />
              </PreferenceSection>

              {/* Summary */}
              <div className="profile-card backdrop-blur-md bg-white/50 rounded-xl p-4 md:p-5 border-2 border-white/70">
                <p className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">your match profile</p>
                <div className="space-y-2 text-xs md:text-sm text-gray-800">
                  {preferences.matchTypes.length > 0 && (
                    <p>
                      <span className="font-semibold">looking for:</span> {matchTypeOptions.filter(o => preferences.matchTypes.includes(o.id)).map(o => o.label).join(', ')}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">energy:</span> {preferences.energyLevel < 30 ? 'flexible' : preferences.energyLevel < 70 ? 'moderate' : 'must match'}
                  </p>
                  <p>
                    <span className="font-semibold">commonalities:</span> {
                      preferences.commonalities === 'flexible' ? 'mix of similar & different' :
                      preferences.commonalities === 'some' ? 'at least one thing in common' :
                      preferences.commonalities === 'similar' ? 'share multiple interests' :
                      'very similar people'
                    }
                  </p>
                  <p>
                    <span className="font-semibold">wildcard:</span> {preferences.surpriseFactor < 30 ? 'play it safe' : preferences.surpriseFactor < 70 ? 'some surprises' : 'totally random!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50 fade-in px-safe pb-safe pt-4">
          <button className="px-6 md:px-8 py-2 md:py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-all duration-300 shadow-2xl text-sm md:text-base whitespace-nowrap">
            save preferences
          </button>
        </div>

        <style jsx>{`
          @supports (padding: max(0px)) {
            .p-safe {
              padding-left: max(1.5rem, env(safe-area-inset-left));
              padding-right: max(1.5rem, env(safe-area-inset-right));
              padding-top: max(1.5rem, env(safe-area-inset-top));
            }
            .px-safe {
              padding-left: max(1rem, env(safe-area-inset-left));
              padding-right: max(1rem, env(safe-area-inset-right));
            }
            .pb-safe {
              padding-bottom: max(2rem, env(safe-area-inset-bottom));
            }
          }

          .safe-area-inset {
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
            padding-top: env(safe-area-inset-top);
          }

          .safe-scroll {
            -webkit-user-select: text;
          }

          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          .bg-gradient-animated {
            background: linear-gradient(135deg, #dbeafe, #e9d5ff, #fae8ff, #ddd6fe, #bfdbfe);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
          }

          .profile-card {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .fade-in {
            animation: fadeIn 0.3s ease-out 0.4s both;
          }
        `}</style>
      </div>
    </>
  );
};

export default PreferencesScreen;