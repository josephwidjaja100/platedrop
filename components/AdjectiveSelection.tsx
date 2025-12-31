"use client"

import React, { useState, useEffect } from 'react';

interface AdjectivePair {
  left: string;
  right: string;
}

interface AdjectiveSelectionProps {
  onComplete: (selections: string[]) => void;
  onSkip?: () => void;
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

const AdjectiveSelection: React.FC<AdjectiveSelectionProps> = ({ onComplete, onSkip }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<string[]>([]);
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelection = (selected: string) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const newSelections = [...selections, selected];
    setSelections(newSelections);

    // Fade out animation
    setTimeout(() => {
      if (currentIndex < adjectivePairs.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setHoveredSide(null);
        setIsTransitioning(false);
      } else {
        // All selections complete
        onComplete(newSelections);
      }
    }, 300);
  };

  const currentPair = adjectivePairs[currentIndex];
  const progress = ((currentIndex + 1) / adjectivePairs.length) * 100;

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
          {/* Progress indicator */}
          <div className="w-full max-w-md mb-8">
            <div className="text-center mb-3">
              <p className="text-sm text-gray-700 font-medium">
                {currentIndex + 1} of {adjectivePairs.length}
              </p>
            </div>
            <div className="w-full h-2 bg-white/40 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question text */}
          <div className="text-center mb-8 px-4">
            <p className="text-lg md:text-xl text-gray-800 font-medium">
              which kind of attractiveness do you tend to notice more?
            </p>
          </div>

          {/* Adjective selection boxes */}
          <div 
            className={`w-full max-w-2xl grid grid-cols-2 gap-4 md:gap-6 ${isTransitioning ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            style={{ minHeight: isMobile ? '200px' : '300px' }}
          >
            {/* Left option */}
            <button
              onClick={() => handleSelection(currentPair.left)}
              onMouseEnter={() => !isMobile && setHoveredSide('left')}
              onMouseLeave={() => !isMobile && setHoveredSide(null)}
              onTouchStart={() => setHoveredSide('left')}
              onTouchEnd={() => setTimeout(() => setHoveredSide(null), 200)}
              className={`
                relative h-full min-h-[200px] md:min-h-[300px] 
                backdrop-blur-md bg-white/50 rounded-2xl 
                border-2 transition-all duration-300
                flex items-center justify-center
                active:scale-95
                ${hoveredSide === 'left' 
                  ? 'border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.6)] scale-105 bg-white/70' 
                  : 'border-white/70 shadow-lg hover:border-purple-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                }
                ${isTransitioning ? 'pointer-events-none' : 'cursor-pointer'}
              `}
            >
              {/* Glow effect */}
              {hoveredSide === 'left' && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-blue-400/20 animate-pulse" />
              )}
              
              <span 
                className={`
                  relative z-10 text-2xl md:text-3xl font-bold
                  transition-all duration-300
                  ${hoveredSide === 'left' 
                    ? 'text-purple-700 scale-110' 
                    : 'text-gray-800'
                  }
                `}
              >
                {currentPair.left}
              </span>
            </button>

            {/* Right option */}
            <button
              onClick={() => handleSelection(currentPair.right)}
              onMouseEnter={() => !isMobile && setHoveredSide('right')}
              onMouseLeave={() => !isMobile && setHoveredSide(null)}
              onTouchStart={() => setHoveredSide('right')}
              onTouchEnd={() => setTimeout(() => setHoveredSide(null), 200)}
              className={`
                relative h-full min-h-[200px] md:min-h-[300px] 
                backdrop-blur-md bg-white/50 rounded-2xl 
                border-2 transition-all duration-300
                flex items-center justify-center
                active:scale-95
                ${hoveredSide === 'right' 
                  ? 'border-pink-400 shadow-[0_0_30px_rgba(236,72,153,0.6)] scale-105 bg-white/70' 
                  : 'border-white/70 shadow-lg hover:border-pink-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                }
                ${isTransitioning ? 'pointer-events-none' : 'cursor-pointer'}
              `}
            >
              {/* Glow effect */}
              {hoveredSide === 'right' && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-blue-400/20 animate-pulse" />
              )}
              
              <span 
                className={`
                  relative z-10 text-2xl md:text-3xl font-bold
                  transition-all duration-300
                  ${hoveredSide === 'right' 
                    ? 'text-pink-700 scale-110' 
                    : 'text-gray-800'
                  }
                `}
              >
                {currentPair.right}
              </span>
            </button>
          </div>

          {/* Skip button (optional) */}
          {onSkip && (
            <button
              onClick={onSkip}
              className="mt-8 text-sm text-gray-600 hover:text-gray-800 underline transition-colors"
            >
              skip for now
            </button>
          )}
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
        `}</style>
      </div>
    </>
  );
};

export default AdjectiveSelection;

