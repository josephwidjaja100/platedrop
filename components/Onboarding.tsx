"use client"

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";

interface AdjectivePair {
  left: string;
  right: string;
}

interface OnboardingProps {
  onComplete: (selections: string[]) => void;
}

const adjectivePairs: AdjectivePair[] = [
  { left: 'cute', right: 'hot' },
  { left: 'casual', right: 'refined' },
  { left: 'golden retriever', right: 'black cat' },
  { left: 'light aesthetic', right: 'dark aesthetic' },
  { left: 'polished', right: 'effortless' },
  { left: 'minimal', right: 'expressive' },
  { left: 'bold', right: 'subtle' },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { data: session } = useSession();
  const email = session?.user?.email || '';
  
  // Load saved progress from localStorage
  const loadProgress = () => {
    if (!email) return { index: 0, selections: [] };
    try {
      const saved = localStorage.getItem(`onboarding_progress_${email}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { index: parsed.index || 0, selections: parsed.selections || [] };
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    }
    return { index: 0, selections: [] };
  };

  const savedProgress = loadProgress();
  const [currentIndex, setCurrentIndex] = useState(savedProgress.index);
  const [selections, setSelections] = useState<string[]>(savedProgress.selections);
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [bypassTriggered, setBypassTriggered] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Local dev bypass - ONLY via keyboard shortcut (Ctrl+B / Cmd+B)
  // Removed auto-bypass so users can actually see and use the onboarding
  useEffect(() => {
    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    if (!isDev || bypassTriggered) return;

    // Keyboard bypass (Ctrl+B / Cmd+B) - manual bypass only
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'b' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (bypassTriggered) return; // Prevent multiple triggers
        console.log('[DEV MODE] Bypassing onboarding via keyboard shortcut');
        setBypassTriggered(true);
        onComplete([]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onComplete, bypassTriggered]);

  const handleSelection = (selected: string) => {
    if (isTransitioning || isCompleting) return;
    
    setIsTransitioning(true);
    const newSelections = [...selections, selected];
    setSelections(newSelections);

    // Save progress to localStorage
    if (email) {
      try {
        const nextIndex = currentIndex + 1;
        localStorage.setItem(`onboarding_progress_${email}`, JSON.stringify({
          index: nextIndex,
          selections: newSelections
        }));
      } catch (e) {
        console.error('Error saving progress:', e);
      }
    }

    // Fade out animation
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < adjectivePairs.length) {
        setCurrentIndex(nextIndex);
        setHoveredSide(null);
        setIsTransitioning(false);
      } else {
        // All selections complete - prevent multiple calls
        if (isCompleting) return;
        setIsCompleting(true);
        
        // Clear progress from localStorage since we're done
        if (email) {
          localStorage.removeItem(`onboarding_progress_${email}`);
        }
        
        console.log('Onboarding complete with selections:', newSelections);
        onComplete(newSelections);
      }
    }, 300);
  };

  const currentPair = adjectivePairs[currentIndex];

  return (
    <>
      <link 
        href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" 
        rel="stylesheet" 
      />
      <div 
        className="fixed inset-0 bg-gradient-animated flex items-center justify-center z-50 p-4"
        style={{ 
          fontFamily: 'Merriweather, serif',
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))'
        }}
      >
        <div className="w-full max-w-4xl flex flex-col items-center justify-center h-full">
          <div className="text-center mb-8 px-4">
            <p className="text-xl md:text-2xl text-gray-700 font-light tracking-wide mb-4">
              which kind of attractiveness do you prefer?
            </p>
            <p className="text-sm text-gray-500 font-light">
              {currentIndex + 1} of {adjectivePairs.length}
            </p>
          </div>

          <div 
            className={`w-full max-w-2xl grid grid-cols-2 gap-4 md:gap-6 ${isTransitioning ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            style={{ minHeight: isMobile ? '200px' : '300px' }}
          >
            <button
              onClick={() => handleSelection(currentPair.left)}
              onMouseEnter={() => setHoveredSide('left')}
              onMouseLeave={() => setHoveredSide(null)}
              onTouchStart={() => setHoveredSide('left')}
              onTouchEnd={() => setTimeout(() => setHoveredSide(null), 200)}
              className={`
                relative h-full min-h-[200px] md:min-h-[300px] 
                backdrop-blur-md bg-white/40 rounded-2xl 
                border border-white/50 transition-all duration-300
                flex items-center justify-center
                active:scale-95
                ${hoveredSide === 'left' 
                  ? 'border-white/90 shadow-onboarding-hover-bright scale-[1.01] bg-white/60' 
                  : 'border-white/50 shadow-onboarding hover:border-white/60 hover:shadow-onboarding-hover'
                }
                ${isTransitioning ? 'pointer-events-none' : 'cursor-pointer'}
              `}
            >
              {hoveredSide === 'left' && (
                <div className="absolute inset-0 rounded-2xl bg-white/5" />
              )}
              
              <span 
                className={`
                  relative z-10 text-2xl md:text-3xl font-light
                  transition-all duration-300
                  ${hoveredSide === 'left' 
                    ? 'text-gray-900' 
                    : 'text-gray-700'
                  }
                `}
              >
                {currentPair.left}
              </span>
            </button>

            <button
              onClick={() => handleSelection(currentPair.right)}
              onMouseEnter={() => setHoveredSide('right')}
              onMouseLeave={() => setHoveredSide(null)}
              onTouchStart={() => setHoveredSide('right')}
              onTouchEnd={() => setTimeout(() => setHoveredSide(null), 200)}
              className={`
                relative h-full min-h-[200px] md:min-h-[300px] 
                backdrop-blur-md bg-white/40 rounded-2xl 
                border border-white/50 transition-all duration-300
                flex items-center justify-center
                active:scale-95
                ${hoveredSide === 'right' 
                  ? 'border-white/90 shadow-onboarding-hover-bright scale-[1.01] bg-white/60' 
                  : 'border-white/50 shadow-onboarding hover:border-white/60 hover:shadow-onboarding-hover'
                }
                ${isTransitioning ? 'pointer-events-none' : 'cursor-pointer'}
              `}
            >
              {hoveredSide === 'right' && (
                <div className="absolute inset-0 rounded-2xl bg-white/5" />
              )}
              
              <span 
                className={`
                  relative z-10 text-2xl md:text-3xl font-light
                  transition-all duration-300
                  ${hoveredSide === 'right' 
                    ? 'text-gray-900' 
                    : 'text-gray-700'
                  }
                `}
              >
                {currentPair.right}
              </span>
            </button>
          </div>
        </div>

        <style>{`
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
          
          .shadow-onboarding {
            box-shadow: 0 0 15px rgba(196, 181, 253, 0.15);
          }
          
          .shadow-onboarding-hover {
            box-shadow: 0 0 25px rgba(196, 181, 253, 0.25), 0 0 40px rgba(221, 214, 254, 0.15);
          }
          
          .shadow-onboarding-hover-bright {
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.6), 0 0 50px rgba(255, 255, 255, 0.4), 0 0 70px rgba(255, 255, 255, 0.2);
          }
        `}</style>
      </div>
    </>
  );
};

export default Onboarding;
