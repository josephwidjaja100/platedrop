"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Instagram, User, Camera, Upload, X } from 'lucide-react';
import Dropdown from '@/components/Dropdown';
import MultiselectDropdown from '@/components/MultiselectDropdown';

const Profile = () => {
  const [editingSection, setEditingSection] = useState(null);
  const [zoomTransform, setZoomTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const sectionRefs = useRef({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [profile, setProfile] = useState({
    name: '',
    year: '',
    major: '',
    instagram: '',
    photo: null,
    gender: '', 
    ethnicity: [], 
    lookingForGender: [],
    lookingForEthnicity: []
  });

  const [editValues, setEditValues] = useState({});

  const genderOptions = ['male', 'female', 'non-binary'];
  const yearOptions = ['freshman', 'sophomore', 'junior', 'senior', 'grad student'];
  const majorOptions = ["aeronautics and astronautics", "african and african american studies", "african studies", "american studies", "anthropology", "applied physics", "archaeology", "art history", "art practice", "asian american studies", "atmosphere / energy", "bioengineering", "biology", "biomechanical engineering", "biomedical computation", "chemical engineering", "chemistry", "chicana/o - latina/o studies", "china studies", "civil engineering", "classics", "communication", "community health and prevention research", "comparative literature", "comparative studies in race and ethnicity", "computer science", "creative writing", "dance (taps minor)", "data science", "data science & social systems", "democracy, development, and the rule of law", "design", "digital humanities", "earth and planetary sciences", "earth systems", "east asian studies", "economics", "education", "electrical engineering", "energy science and engineering", "engineering physics", "english", "environmental systems engineering", "ethics in society", "european studies", "feminist, gender, and sexuality studies", "film and media studies", "french", "geophysics", "german studies", "global studies", "history", "honors in the arts", "human biology", "human rights", "iberian and latin american cultures", "international policy studies", "international relations", "international security studies", "iranian studies", "islamic studies", "italian", "japanese", "jewish studies", "korean", "laboratory animal science", "latin american studies", "linguistics", "management science and engineering", "materials science and engineering", "mathematical and computational science", "mathematics", "mechanical engineering", "medieval studies", "middle eastern language, literature and culture", "modern languages", "modern thought and literature", "music", "music, science, and technology", "native american studies", "philosophy", "philosophy and religious studies", "physics", "political science", "portuguese", "psychology", "public policy", "religious studies", "science, technology, and society", "slavic languages and literatures", "sociology", "south asian studies", "spanish", "statistics", "sustainability", "sustainable architecture + engineering", "symbolic systems", "theater and performance studies", "translation studies", "urban studies"];
  const ethnicityOptions = ['prefer not to answer', 'african', 'asian (east)', 'asian (south)', 'asian (southeast)', 'black / african american', 'hispanic / latinx', 'middle eastern / north african', 'native american / alaskan native', 'native hawaiian / pacific islander', 'white'];

  const mobileSections = [
    { 
      id: 'basic', 
      title: 'basic info', 
      icon: User,
      gridClass: 'col-span-1 row-span-1',
      estimatedExpandedHeight: 400
    },
    { 
      id: 'instagram', 
      title: 'instagram', 
      icon: Instagram,
      gridClass: 'col-span-1 row-span-1',
      estimatedExpandedHeight: 100
    },
    { 
      id: 'lookingFor', 
      title: 'looking for', 
      icon: User,
      gridClass: 'col-span-2 row-span-1',
      estimatedExpandedHeight: 350
    },
    { 
      id: 'photo', 
      title: 'photo', 
      icon: Camera,
      gridClass: 'col-span-2 row-span-2',
      estimatedExpandedHeight: 300
    }
  ];

  const desktopSections = [
    { 
      id: 'basic', 
      title: 'basic info', 
      icon: User,
      gridClass: 'col-span-1 row-span-1',
      estimatedExpandedHeight: 400
    },
    { 
      id: 'instagram', 
      title: 'instagram', 
      icon: Instagram,
      gridClass: 'col-span-1 row-span-1',
      estimatedExpandedHeight: 100
    },
    { 
      id: 'lookingFor', 
      title: 'looking for', 
      icon: User,
      gridClass: 'col-span-2 row-span-2',
      estimatedExpandedHeight: 350
    },
    { 
      id: 'photo', 
      title: 'photo', 
      icon: Camera,
      gridClass: 'col-span-2 row-span-3 col-start-3 row-start-1',
      estimatedExpandedHeight: 300
    }
  ];

  const profileSections = isMobile ? mobileSections : desktopSections;

  const handleSectionClick = (section) => {
    if (editingSection) return;

    const sectionEl = sectionRefs.current[section.id];
    if (!sectionEl) return;

    const sectionRect = sectionEl.getBoundingClientRect();
    
    // Button height + padding from bottom (approximately 250px total)
    const buttonAreaHeight = 250;
    const topPadding = 20; // Padding from top
    
    // Available viewport height for the expanded section
    const availableHeight = window.innerHeight - buttonAreaHeight - topPadding;
    
    // Calculate target Y position (top of available area + some padding)
    const targetY = topPadding + availableHeight / 2;
    
    // Current center of section
    const sectionCenterX = sectionRect.left + sectionRect.width / 2;
    const sectionCenterY = sectionRect.top + sectionRect.height / 2;
    
    const viewportCenterX = window.innerWidth / 2;
    
    const scale = isMobile ? 1 : 1.5; 
    
    // Calculate translation to move section to the desired position
    const translateX = isMobile ? 0 : (viewportCenterX - sectionCenterX) / scale;
    const translateY = isMobile ? 0 : (targetY - sectionCenterY) / scale;

    setZoomTransform({ scale, x: translateX, y: translateY });

    setEditValues({
      name: profile.name,
      year: profile.year,
      major: profile.major,
      instagram: profile.instagram,
      photo: profile.photo,
      gender: profile.gender,
      ethnicity: [...profile.ethnicity],
      lookingForGender: [...profile.lookingForGender],
      lookingForEthnicity: [...profile.lookingForEthnicity]
    });

    setEditingSection(section.id);
  };

  const handleSave = () => {
    setProfile(editValues);
    setEditingSection(null);
    setZoomTransform({ scale: 1, x: 0, y: 0 });
  };

  const handleCancel = () => {
    setEditingSection(null);
    setZoomTransform({ scale: 1, x: 0, y: 0 });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditValues({
          ...editValues,
          photo: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setEditValues({
      ...editValues,
      photo: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderSectionContent = (section) => {
    const isEditing = editingSection === section.id;

    if (!isEditing) {
      switch (section.id) {
        case 'basic':
          return (
            <div className="space-y-2">
              <p className={`font-bold text-lg leading-tight ${profile.name ? 'text-gray-900' : 'text-gray-400'}`}>
                {profile.name || 'plate drop'}
              </p>
              <p className="text-base leading-tight">
                <span className={profile.ethnicity.length > 0 ? 'text-gray-700' : 'text-gray-400'}>
                  {profile.ethnicity.length > 0 ? profile.ethnicity.join(', ') : 'ethnicity'}
                </span>
                <span className="text-gray-700"> • </span>
                <span className={profile.gender ? 'text-gray-700' : 'text-gray-400'}>
                  {profile.gender || 'gender'}
                </span>
              </p>
              <p className="text-base leading-tight">
                <span className={profile.year ? 'text-gray-700' : 'text-gray-400'}>
                  {profile.year || 'freshman'}
                </span>
                <span className="text-gray-700"> • </span>
                <span className={profile.major ? 'text-gray-700' : 'text-gray-400'}>
                  {profile.major || 'food science'}
                </span>
              </p>
            </div>
          );
        case 'photo':
          return (
            <div className="w-full h-full flex items-center justify-center">
              {profile.photo ? (
                <div className="w-full aspect-square overflow-hidden rounded-lg">
                  <img 
                    src={profile.photo} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square flex flex-col items-center justify-center text-gray-400 gap-2 border-2 border-dashed border-gray-400/40 rounded-lg">
                  <Camera size={48} />
                  <p className="text-base text-center">add a photo</p>
                </div>
              )}
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
        case 'lookingFor':
          return (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">gender preference</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.lookingForGender.length > 0 ? (
                    profile.lookingForGender.map((gender, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-xs md:text-sm text-gray-800 font-medium tag-gradient">
                        {gender}
                      </span>
                    ))
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs md:text-sm text-gray-400 font-medium tag-gradient">
                      any gender
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">ethnicity preference</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.lookingForEthnicity.length > 0 ? (
                    profile.lookingForEthnicity.map((ethnicity, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-xs md:text-sm text-gray-800 font-medium tag-gradient">
                        {ethnicity}
                      </span>
                    ))
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs md:text-sm text-gray-400 font-medium tag-gradient">
                      any ethnicity
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
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
              className="w-full px-4 py-3 border-2 border-gray-400/40 rounded-lg transition-all duration-200 focus:outline-none focus:border-gray-700 text-gray-900 text-sm bg-white hover:border-gray-400/60 placeholder-gray-400"
            />
            <MultiselectDropdown
              values={editValues.ethnicity}
              onChange={(val) => setEditValues({...editValues, ethnicity: val})}
              options={ethnicityOptions}
              placeholder="ethnicity"
              maxDisplay={2}
            />
            <Dropdown
              value={editValues.gender}
              onChange={(val) => setEditValues({...editValues, gender: val})}
              options={genderOptions}
              placeholder="gender"
            />
            <Dropdown
              value={editValues.year}
              onChange={(val) => setEditValues({...editValues, year: val})}
              options={yearOptions}
              placeholder="year"
            />
            <Dropdown
              value={editValues.major}
              onChange={(val) => setEditValues({...editValues, major: val})}
              options={majorOptions}
              placeholder="major"
            />
          </div>
        );
      
      case 'photo':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            {editValues.photo ? (
              <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                <img 
                  src={editValues.photo} 
                  alt="Profile preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex flex-col items-center justify-center gap-3 cursor-pointer w-full aspect-square border-2 border-dashed border-gray-400/60 rounded-lg hover:border-gray-700 hover:bg-white/30 transition-all"
                >
                  <Upload size={48} className="text-gray-600" />
                  <p className="text-sm text-gray-700 font-medium text-center px-4">
                    click to upload photo
                  </p>
                </label>
              </>
            )}
          </div>
        );
      
      case 'instagram':
        return (
          <div className="relative w-full">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-800 text-sm z-10">
              @ 
            </div>
            <input
              type="text"
              value={editValues.instagram}
              onChange={(e) => setEditValues({...editValues, instagram: e.target.value})}
              placeholder="username"
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-400/40 rounded-lg transition-all duration-200 focus:outline-none focus:border-gray-700 text-gray-900 text-sm bg-white hover:border-gray-400/60 placeholder-gray-400"
            />
          </div>
        );
      
      case 'lookingFor':
        return (
          <div className="w-full space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">gender preference</p>
              <MultiselectDropdown
                values={editValues.lookingForGender}
                onChange={(val) => setEditValues({...editValues, lookingForGender: val})}
                options={genderOptions}
                placeholder="gender preference"
                maxDisplay={2}
              />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">ethnicity preference</p>
              <MultiselectDropdown
                values={editValues.lookingForEthnicity}
                onChange={(val) => setEditValues({...editValues, lookingForEthnicity: val})}
                options={ethnicityOptions}
                placeholder="ethnicity preference"
                maxDisplay={2}
              />
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
      
      <div 
        className={`fixed inset-0 bg-gradient-animated ${isMobile ? 'overflow-y-auto safe-scroll' : 'overflow-hidden'} flex flex-col items-center justify-start p-safe safe-area-inset`} 
        style={{ fontFamily: 'Merriweather, serif' }}
      >
        <div 
          ref={containerRef}
          className={`transition-transform duration-500 ease-out w-full ${isMobile ? 'min-h-fit py-8' : 'h-full flex flex-col items-center justify-center'}`}
          style={{
            transform: isMobile ? 'none' : `scale(${zoomTransform.scale}) translate(${zoomTransform.x}px, ${zoomTransform.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          <div className={`w-full mx-auto ${isMobile ? 'max-w-md px-4' : 'max-w-4xl px-safe relative'}`}>
            <div className={`text-center ${isMobile ? 'mb-6' : 'mb-3 md:mb-6'}`}>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">your profile</h1>
              <p className="text-gray-700 mt-1.5 text-xs md:text-sm">click any section to edit</p>
            </div>

            <div 
              className={`
                ${isMobile ? 'grid grid-cols-2 gap-4 mb-20' : 'grid grid-cols-4 gap-2 md:gap-3'} 
                w-full
              `} 
              style={isMobile ? {} : { gridAutoRows: 'minmax(110px, auto)' }}
            >
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
                      ${isMobile ? 'min-h-[140px]' : ''}
                    `}
                    style={{
                      minHeight: isMobile ? '140px' : '75px',
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
          <div className={`fixed ${isMobile ? 'bottom-4' : 'bottom-0'} left-0 right-0 flex justify-center gap-3 md:gap-5 fade-in px-safe ${isMobile ? 'pb-4' : 'pb-safe pt-4'} pointer-events-none`}>
            <button
              onClick={handleSave}
              className="px-6 md:px-8 py-2 md:py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-all duration-300 shadow-2xl text-sm md:text-base whitespace-nowrap pointer-events-auto"
            >
              save changes
            </button>
            <button
              onClick={handleCancel}
              className="px-6 md:px-8 py-2 md:py-3 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-all duration-300 border-2 border-gray-400 shadow-2xl text-sm md:text-base whitespace-nowrap pointer-events-auto"
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
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
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
        `}</style>
      </div>
    </>
  );
};

export default Profile;