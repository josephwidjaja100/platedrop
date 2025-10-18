"use client"

import React, { useState, useRef } from 'react';
import PageSelector from '../../components/PageSelector';
import { Instagram, Music, Utensils, Dumbbell, Palette, Coffee, X, Plus, User, Laugh } from 'lucide-react';

const Profile = () => {
  const [editingSection, setEditingSection] = useState(null);
  const [newInterestTag, setNewInterestTag] = useState('');
  const [newLookingForTag, setNewLookingForTag] = useState('');
  const [zoomTransform, setZoomTransform] = useState({ scale: 1, x: 0, y: 0 });
  const containerRef = useRef(null);
  const sectionRefs = useRef({});
  const textareaRefs = useRef({});

  const [profile, setProfile] = useState({
    name: '',
    year: '',
    major: '',
    instagram: '',
    bio: '',
    interests: [],
    lookingFor: [],
    music: '',
    food: '',
    activity: ''
  });

  const [editValues, setEditValues] = useState({});

  const charLimits = {
    bio: 200,
    music: 50,
    food: 50,
    activity: 100,
    tag: 15,
    maxTags: 10
  };

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

  const handleSectionClick = (section) => {
    if (editingSection) return;

    const isMobile = window.innerWidth < 768;

    const sectionEl = sectionRefs.current[section.id];
    if (!sectionEl) return;

    const sectionRect = sectionEl.getBoundingClientRect();
    
    const sectionCenterX = sectionRect.left + sectionRect.width / 2;
    const sectionCenterY = sectionRect.top + sectionRect.height / 2;
    
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    
    const scale = isMobile ? 1 : 1.75; 
    const translateX = isMobile ? 0 : (viewportCenterX - sectionCenterX) / scale;
    const translateY = isMobile ? 0 : (viewportCenterY - sectionCenterY) / scale;

    setZoomTransform({ scale, x: translateX, y: translateY });

    setEditValues({
      name: profile.name,
      year: profile.year,
      major: profile.major,
      instagram: profile.instagram,
      bio: profile.bio,
      interests: [...profile.interests],
      lookingFor: [...profile.lookingFor],
      music: profile.music,
      food: profile.food,
      activity: profile.activity
    });

    setEditingSection(section.id);
    // If this is the 'activity' section and on mobile, scroll it into view smoothly
    if (isMobile && section.id === 'activity') {
      // Use scrollIntoView on the element; center it in the viewport
      try {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      } catch (e) {
        // fallback: adjust container scrollTop
        if (containerRef.current && typeof containerRef.current.scrollTo === 'function') {
          const rect = sectionEl.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          const offset = rect.top - containerRect.top - (containerRect.height / 2) + (rect.height / 2);
          containerRef.current.scrollTo({ top: containerRef.current.scrollTop + offset, behavior: 'smooth' });
        }
      }
    }
    setTimeout(() => {
      if (['bio', 'music', 'food', 'activity'].includes(section.id)) {
        adjustTextareaHeight(section.id);
      }
    }, 0);
  };

  const handleSave = () => {
    setProfile(editValues);
    setEditingSection(null);
    setZoomTransform({ scale: 1, x: 0, y: 0 });
    setNewInterestTag('');
    setNewLookingForTag('');
  };

  const handleCancel = () => {
    setEditingSection(null);
    setZoomTransform({ scale: 1, x: 0, y: 0 });
    setNewInterestTag('');
    setNewLookingForTag('');
  };

  const addInterestTag = () => {
    if (newInterestTag.trim() && newInterestTag.length <= charLimits.tag && editValues.interests.length < charLimits.maxTags && !editValues.interests.includes(newInterestTag.trim())) {
      setEditValues({
        ...editValues,
        interests: [...editValues.interests, newInterestTag.trim()]
      });
      setNewInterestTag('');
    }
  };

  const removeInterestTag = (tagToRemove) => {
    setEditValues({
      ...editValues,
      interests: editValues.interests.filter(tag => tag !== tagToRemove)
    });
  };

  const addLookingForTag = () => {
    if (newLookingForTag.trim() && newLookingForTag.length <= charLimits.tag && editValues.lookingFor.length < charLimits.maxTags && !editValues.lookingFor.includes(newLookingForTag.trim())) {
      setEditValues({
        ...editValues,
        lookingFor: [...editValues.lookingFor, newLookingForTag.trim()]
      });
      setNewLookingForTag('');
    }
  };

  const removeLookingForTag = (tagToRemove) => {
    setEditValues({
      ...editValues,
      lookingFor: editValues.lookingFor.filter(tag => tag !== tagToRemove)
    });
  };

  const adjustTextareaHeight = (fieldId) => {
    const textarea = textareaRefs.current[fieldId];
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  const handleTextareaChange = (fieldId, value, updateFunc, limit) => {
    if (value.length <= limit) {
      updateFunc(value);
      setTimeout(() => adjustTextareaHeight(fieldId), 0);
    }
  };

  const renderSectionContent = (section) => {
    const isEditing = editingSection === section.id;

    if (!isEditing) {
      switch (section.id) {
        case 'basic':
          return (
            <div className="space-y-1">
              <p className={`font-bold text-lg leading-tight ${profile.name ? 'text-gray-900' : 'text-gray-400'}`}>
                {profile.name || 'plate drop'}
              </p>
              <p className={`text-base leading-tight ${(profile.year || profile.major) ? 'text-gray-700' : 'text-gray-400'}`}>
                {profile.year || 'freshman'} • {profile.major || 'food science'}
              </p>
            </div>
          );
        case 'instagram':
          return (
            <p className="text-base">
              <span className="text-gray-800">@</span>
              <span className={profile.instagram ? 'text-gray-800' : 'text-gray-400'}>
                {profile.instagram || 'plate.drop'}
              </span>
            </p>
          );
        case 'bio':
          return <p className={`text-base leading-relaxed ${profile.bio ? 'text-gray-800' : 'text-gray-400'}`}>{profile.bio || 'plate drop > date drop'}</p>;
        case 'interests':
          return (
            <div className="flex flex-wrap gap-2">
              {profile.interests.length > 0 ? (
                profile.interests.map((interest, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-sm text-gray-800 font-medium tag-gradient">
                    {interest}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1.5 rounded-full text-sm text-gray-400 font-medium tag-gradient">
                  matching with plates
                </span>
              )}
            </div>
          );
        case 'lookingFor':
          return (
            <div className="flex flex-wrap gap-2">
              {profile.lookingFor.length > 0 ? (
                profile.lookingFor.map((item, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-800 tag-gradient">
                    {item}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1.5 rounded-full text-sm text-gray-400 font-medium tag-gradient">
                  plate partner
                </span>
              )}
            </div>
          );
        case 'music':
          return <p className={`text-base leading-relaxed break-words whitespace-pre-wrap ${profile.music ? 'text-gray-800' : 'text-gray-400'}`}>{profile.music || 'plate music'}</p>;
        case 'food':
          return <p className={`text-base leading-relaxed break-words whitespace-pre-wrap ${profile.food ? 'text-gray-800' : 'text-gray-400'}`}>{profile.food || 'plate food'}</p>;
        case 'activity':
          return <p className={`text-base leading-relaxed break-words whitespace-pre-wrap ${profile.activity ? 'text-gray-800' : 'text-gray-400'}`}>{profile.activity || 'going to restaurant (with plate)'}</p>;
        default:
          return null;
      }
    }

    switch (section.id) {
      case 'basic':
        return (
          <div className="space-y-2 w-full">
            <input
              type="text"
              value={editValues.name}
              onChange={(e) => setEditValues({...editValues, name: e.target.value})}
              placeholder="name"
              className="w-full px-4 py-3 border-2 border-gray-400/40 rounded-lg transition-all duration-200 focus:outline-none focus:border-gray-700 text-gray-900 text-base bg-white hover:border-gray-400/60 placeholder-gray-400"
            />
            <input
              type="text"
              value={editValues.year}
              onChange={(e) => setEditValues({...editValues, year: e.target.value})}
              placeholder="year"
              className="w-full px-4 py-3 border-2 border-gray-400/40 rounded-lg transition-all duration-200 focus:outline-none focus:border-gray-700 text-gray-900 text-base bg-white hover:border-gray-400/60 placeholder-gray-400"
            />
            <input
              type="text"
              value={editValues.major}
              onChange={(e) => setEditValues({...editValues, major: e.target.value})}
              placeholder="major"
              className="w-full px-4 py-3 border-2 border-gray-400/40 rounded-lg transition-all duration-200 focus:outline-none focus:border-gray-700 text-gray-900 text-base bg-white hover:border-gray-400/60 placeholder-gray-400"
            />
          </div>
        );
      
      case 'instagram':
        return (
          <div className="relative w-full">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-800 text-base z-10">
              @
            </div>
            <input
              type="text"
              value={editValues.instagram}
              onChange={(e) => setEditValues({...editValues, instagram: e.target.value})}
              placeholder="username"
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-400/40 rounded-lg transition-all duration-200 focus:outline-none focus:border-gray-700 text-gray-900 text-base bg-white hover:border-gray-400/60 placeholder-gray-400"
            />
          </div>
        );
      
      case 'bio':
        return (
          <div className="space-y-2 w-full relative">
            <textarea
              ref={el => textareaRefs.current['bio'] = el}
              value={editValues.bio}
              onChange={(e) => handleTextareaChange('bio', e.target.value, (val) => setEditValues({...editValues, bio: val}), charLimits.bio)}
              placeholder="tell us about yourself..."
              className="w-full px-4 py-3 border-2 border-gray-400/40 rounded-lg transition-all duration-200 focus:outline-none focus:border-gray-700 text-gray-900 resize-none text-base bg-white hover:border-gray-400/60 overflow-hidden"
              style={{ minHeight: '60px' }}
            />
            <div className="absolute bottom-5 right-2 text-xs text-gray-600">
              {editValues.bio.length} / {charLimits.bio}
            </div>
          </div>
        );
      
      case 'interests':
        return (
          <div className="space-y-4 w-full relative">
            <div className="space-y-2 relative">
              <div className="flex gap-3 w-full relative">
                <input
                  type="text"
                  value={newInterestTag}
                  onChange={(e) => {
                    if (e.target.value.length <= charLimits.tag) {
                      setNewInterestTag(e.target.value);
                    }
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && addInterestTag()}
                  placeholder="cooking, rock climbing, origami..."
                  className="flex-1 px-4 py-3 pr-16 border-2 border-gray-400/40 rounded-lg transition-all duration-200 focus:outline-none focus:border-gray-700 text-gray-900 text-base bg-white hover:border-gray-400/60"
                />
                <div className="absolute -bottom-1 right-18 transform -translate-y-1/2 text-xs text-gray-600">
                  {newInterestTag.length} / {charLimits.tag}
                </div>
                <button
                  onClick={addInterestTag}
                  disabled={editValues.interests.length >= charLimits.maxTags}
                  className="px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {editValues.interests.map((tag, i) => (
                <span 
                  key={i} 
                  className="px-4 py-2 rounded-full text-base font-medium text-gray-800 flex items-center gap-2 tag-gradient flex-shrink-0"
                >
                  {tag}
                  <button
                    onClick={() => removeInterestTag(tag)}
                    className="hover:bg-white/90 rounded-full p-0.5 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>
            <div className="absolute bottom-0 right-0 text-xs text-gray-600">
              {editValues.interests.length} / {charLimits.maxTags} tags
            </div>
          </div>
        );
      
      case 'lookingFor':
        return (
          <div className="space-y-4 w-full relative">
            <div className="space-y-2 relative">
              <div className="flex gap-3 w-full relative">
                <input
                  type="text"
                  value={newLookingForTag}
                  onChange={(e) => {
                    if (e.target.value.length <= charLimits.tag) {
                      setNewLookingForTag(e.target.value);
                    }
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && addLookingForTag()}
                  placeholder="chill person, gym bro, caffeine addict..."
                  className="flex-1 px-4 py-3 pr-16 border-2 border-gray-400/40 rounded-lg transition-all duration-200 focus:outline-none focus:border-gray-700 text-gray-900 text-base bg-white hover:border-gray-400/60"
                />
                <div className="absolute -bottom-1 right-18 transform -translate-y-1/2 text-xs text-gray-600">
                  {newLookingForTag.length} / {charLimits.tag}
                </div>
                <button
                  onClick={addLookingForTag}
                  disabled={editValues.lookingFor.length >= charLimits.maxTags}
                  className="px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {editValues.lookingFor.map((tag, i) => (
                <span 
                  key={i} 
                  className="px-4 py-2 rounded-full text-base font-medium text-gray-800 flex items-center gap-2 tag-gradient flex-shrink-0"
                >
                  {tag}
                  <button
                    onClick={() => removeLookingForTag(tag)}
                    className="hover:bg-white/90 rounded-full p-0.5 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>
            <div className="absolute bottom-0 right-0 text-xs text-gray-600">
              {editValues.lookingFor.length} / {charLimits.maxTags} tags
            </div>
          </div>
        );
      
      case 'music':
        return (
          <div className="space-y-2 w-full relative">
            <textarea
              ref={el => textareaRefs.current['music'] = el}
              value={editValues.music}
              onChange={(e) => handleTextareaChange('music', e.target.value, (val) => setEditValues({...editValues, music: val}), charLimits.music)}
              placeholder="favorite artists..."
              className="w-full px-4 py-3 border-2 border-gray-400/40 rounded-lg transition-all duration-200 focus:outline-none focus:border-gray-700 text-gray-900 text-base bg-white resize-none hover:border-gray-400/60 overflow-hidden"
              style={{ minHeight: '24px', maxHeight: '100px' }}
            />
            <div className="absolute bottom-5 right-2 text-xs text-gray-600">
              {editValues.music.length} / {charLimits.music}
            </div>
          </div>
        );
      
      case 'food':
        return (
          <div className="space-y-2 w-full relative">
            <textarea
              ref={el => textareaRefs.current['food'] = el}
              value={editValues.food}
              onChange={(e) => handleTextareaChange('food', e.target.value, (val) => setEditValues({...editValues, food: val}), charLimits.food)}
              placeholder="favorite foods..."
              className="w-full px-4 py-3 border-2 border-gray-400/40 rounded-lg transition-all duration-200 focus:outline-none focus:border-gray-700 text-gray-900 text-base bg-white resize-none hover:border-gray-400/60 overflow-hidden"
              style={{ minHeight: '24px', maxHeight: '100px' }}
            />
            <div className="absolute bottom-5 right-2 text-xs text-gray-600">
              {editValues.food.length} / {charLimits.food}
            </div>
          </div>
        );
      
      case 'activity':
        return (
          <div className="space-y-2 w-full relative">
            <textarea
              ref={el => textareaRefs.current['activity'] = el}
              value={editValues.activity}
              onChange={(e) => handleTextareaChange('activity', e.target.value, (val) => setEditValues({...editValues, activity: val}), charLimits.activity)}
              placeholder="i want to ______ with my plate..."
              className="w-full px-4 py-3 border-2 border-gray-400/40 rounded-lg transition-all duration-200 focus:outline-none focus:border-gray-700 text-gray-900 text-base bg-white resize-none hover:border-gray-400/60 overflow-hidden"
              style={{ minHeight: '24px', maxHeight: '100px' }}
            />
            <div className="absolute bottom-5 right-2 text-xs text-gray-600">
              {editValues.activity.length} / {charLimits.activity}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <link 
        href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" 
        rel="stylesheet" 
      />
      
      <div className="fixed inset-0 bg-gradient-animated overflow-hidden flex flex-col items-center justify-start p-safe safe-area-inset" style={{ fontFamily: 'Merriweather, serif' }}>
        <div 
          ref={containerRef}
          className="transition-transform duration-500 ease-out w-full flex-1 flex flex-col items-center md:justify-center overflow-y-auto safe-scroll"
          style={{
            transform: `scale(${zoomTransform.scale}) translate(${zoomTransform.x}px, ${zoomTransform.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          <div className="w-full max-w-4xl mx-auto md:max-w-sm lg:max-w-lg xl:max-w-xl px-safe relative">
            {/* Minimalist PageSelector, top left, desktop only */}
            <div className="hidden md:flex flex-col items-center justify-center absolute left-0 top-0 h-full z-30">
              <PageSelector />
            </div>
            <div className="text-center mb-4 md:mb-8 mt-4 md:mt-0">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900">your profile</h1>
              <p className="text-gray-700 mt-2 md:mt-3 text-xs md:text-base">click any section to edit</p>
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-4 auto-rows-auto w-full pb-24 md:pb-4">
              {profileSections.map((section) => {
                const isEditing = editingSection === section.id;
                const isOtherEditing = editingSection && editingSection !== section.id;
                
                return (
                  <div
                    key={section.id}
                    ref={el => sectionRefs.current[section.id] = el}
                    onClick={() => !isEditing && handleSectionClick(section)}
                    className={`
                      ${section.gridClass}
                      ${isOtherEditing ? 'opacity-20 pointer-events-none' : ''}
                      ${!editingSection ? 'cursor-pointer hover:bg-white/70 hover:shadow-2xl hover:scale-[1.02]' : ''}
                      profile-card backdrop-blur-md bg-white/50 rounded-xl p-3 md:p-5 border-2 border-white/70 transition-all duration-300 flex flex-col overflow-visible
                    `}
                    style={{
                      minHeight: '80px',
                      zIndex: isEditing ? 50 : 1
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">
                        {section.title}
                      </span>
                      {section.icon && <section.icon size={14} className="text-gray-600" />}
                    </div>
                    
                    <div className="flex-1 flex items-start overflow-visible text-xs md:text-base">
                      {renderSectionContent(section)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {editingSection && (
          <div className="fixed bottom-0 left-0 right-0 flex justify-center gap-3 md:gap-5 z-50 fade-in px-safe pb-safe pt-4">
            <button
              onClick={handleSave}
              className="px-6 md:px-8 py-2 md:py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-all duration-300 shadow-2xl text-sm md:text-base whitespace-nowrap"
            >
              save changes
            </button>
            <button
              onClick={handleCancel}
              className="px-6 md:px-8 py-2 md:py-3 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-all duration-300 border-2 border-gray-400 shadow-2xl text-sm md:text-base whitespace-nowrap"
            >
              cancel
            </button>
          </div>
        )}

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
          
          .bg-gradient-animated {
            background: linear-gradient(135deg, #dbeafe, #e9d5ff, #fae8ff, #ddd6fe, #bfdbfe);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
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

          /* Mobile: reduce text sizes and padding inside profile cards */
          @media (max-width: 767px) {
          }
         /* (mobile font-size overrides removed) */
        `}</style>
      </div>
    </>
  );
};

export default Profile;