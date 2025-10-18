"use client"

import React, { useState, useRef } from 'react';
import { Instagram, Music, Utensils, Dumbbell, Palette, Coffee, User, Laugh, MessageCircle, X } from 'lucide-react';
import PageSelector from '../../components/PageSelector';

const MatchCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [matchProfile] = useState({
    name: 'Alex',
    year: 'Junior',
    major: 'Computer Science',
    instagram: 'alex.codes',
    bio: 'caffeine fueled developer who loves hiking on weekends',
    interests: ['coding', 'hiking', 'coffee', 'gaming'],
    lookingFor: ['study buddy', 'adventure buddy'],
    music: 'indie, lofi, shoegaze',
    food: 'thai food, ramen, anything spicy',
    activity: 'explore new hiking trails or work on a side project together'
  });

  const profileSections = [
    { 
      id: 'basic', 
      title: 'basic info', 
      icon: User,
      gridClass: 'col-span-1 row-span-1',
    },
    { 
      id: 'bio', 
      title: 'about me', 
      icon: Coffee,
      gridClass: 'col-span-1 row-span-2',
    },
    { 
      id: 'instagram', 
      title: 'instagram', 
      icon: Instagram,
      gridClass: 'col-span-1 row-span-1',
    },
    { 
      id: 'interests', 
      title: 'interests', 
      icon: Palette,
      gridClass: 'col-span-2 row-span-1',
    },
    { 
      id: 'lookingFor', 
      title: 'looking for', 
      icon: Dumbbell,
      gridClass: 'col-span-2 row-span-1',
    },
    { 
      id: 'music', 
      title: 'music', 
      icon: Music,
      gridClass: 'col-span-1 row-span-1',
    },
    { 
      id: 'food', 
      title: 'food', 
      icon: Utensils,
      gridClass: 'col-span-1 row-span-1',
    },
    { 
      id: 'activity', 
      title: 'ideal plate', 
      icon: Laugh,
      gridClass: 'col-span-2 row-span-1',
    }
  ];

  const renderSectionContent = (section) => {
    switch (section.id) {
      case 'basic':
        return (
          <div className="space-y-1">
            <p className="font-bold text-base leading-tight text-gray-900">
              {matchProfile.name}
            </p>
            <p className="text-sm leading-tight text-gray-700">
              {matchProfile.year} • {matchProfile.major}
            </p>
          </div>
        );
      case 'instagram':
        return (
          <p className="text-sm">
            <span className="text-gray-800">@</span>
            <span className="text-gray-800">
              {matchProfile.instagram}
            </span>
          </p>
        );
      case 'bio':
        return <p className="text-sm leading-relaxed text-gray-800">{matchProfile.bio}</p>;
      case 'interests':
        return (
          <div className="flex flex-wrap gap-2">
            {matchProfile.interests.map((interest, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-xs text-gray-800 font-medium tag-gradient">
                {interest}
              </span>
            ))}
          </div>
        );
      case 'lookingFor':
        return (
          <div className="flex flex-wrap gap-2">
            {matchProfile.lookingFor.map((item, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-800 tag-gradient">
                {item}
              </span>
            ))}
          </div>
        );
      case 'music':
        return <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-gray-800">{matchProfile.music}</p>;
      case 'food':
        return <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-gray-800">{matchProfile.food}</p>;
      case 'activity':
        return <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-gray-800">{matchProfile.activity}</p>;
      default:
        return null;
    }
  };

  return (
    <div 
      className="w-full max-w-sm cursor-pointer perspective"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="relative transition-transform duration-500 inline-block"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front - Question Mark */}
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center rounded-2xl backdrop-blur-md bg-white/50 border-2 border-white/70 shadow-xl"
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="text-center">
            <div className="text-8xl font-bold text-gray-400 mb-4">?</div>
            <p className="text-gray-600 font-semibold">click to reveal your plate</p>
          </div>
        </div>

        {/* Back - Profile */}
        <div
          className="rounded-2xl backdrop-blur-md bg-white/50 border-2 border-white/70 shadow-xl p-4"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="grid grid-cols-2 gap-2 auto-rows-auto">
            {profileSections.map((section) => (
              <div
                key={section.id}
                className={`
                  ${section.gridClass}
                  profile-card backdrop-blur-md bg-white/50 rounded-lg p-2 border border-white/70 flex flex-col overflow-visible
                `}
                style={{ minHeight: '60px' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {section.title}
                  </span>
                  {section.icon && <section.icon size={12} className="text-gray-600" />}
                </div>
                
                <div className="flex-1 flex items-start overflow-visible text-xs">
                  {renderSectionContent(section)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MatchesScreen = () => {
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

            <div className="text-center mb-8 md:mb-12 mt-4 md:mt-0">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900">this week's plate</h1>
              <p className="text-gray-700 mt-2 md:mt-3 text-xs md:text-base">click the card to see who you're matched with</p>
            </div>

            {/* Match Card */}
            <div className="flex justify-center items-center mb-8 min-h-96">
              <MatchCard />
            </div>
          </div>
        </div>

        <style>{`
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

          .tag-gradient {
            background: linear-gradient(135deg, rgba(219, 234, 254, 0.9), rgba(233, 213, 255, 0.9), rgba(250, 232, 255, 0.9), rgba(221, 214, 254, 0.9));
            background-size: 300% 300%;
            animation: tagGradientShift 10s ease infinite;
          }

          @keyframes tagGradientShift {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          .perspective {
            perspective: 1000px;
          }
        `}</style>
      </div>
    </>
  );
};

export default MatchesScreen;