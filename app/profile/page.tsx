"use client"

import React, { useState, useRef } from 'react';
import { Camera, Instagram, Music, Utensils, Dumbbell, Palette, Coffee, X, Plus } from 'lucide-react';

const Profile = () => {
  const [editingSection, setEditingSection] = useState(null);
  const [newInterestTag, setNewInterestTag] = useState('');
  const [newLookingForTag, setNewLookingForTag] = useState('');
  const [zoomTransform, setZoomTransform] = useState({ scale: 1, x: 0, y: 0 });
  const containerRef = useRef(null);
  const sectionRefs = useRef({});

  const [profile, setProfile] = useState({
    name: 'alex chen',
    year: 'sophomore',
    major: 'computer science',
    instagram: '@alexchen',
    bio: 'coffee enthusiast, terrible at tennis, always down for late night dhall runs',
    interests: ['indie music', 'cooking', 'hiking', 'photography'],
    lookingFor: ['study buddy', 'gym partner'],
    favorites: {
      music: 'phoebe bridgers, bon iver, mitski',
      food: 'thai food, burritos, basically anything spicy',
      activity: 'sunset hikes, spontaneous road trips'
    }
  });

  const [editValues, setEditValues] = useState({});

  const profileSections = [
    { 
      id: 'basic', 
      title: 'basic info', 
      icon: null,
      gridClass: 'col-span-1 row-span-1',
      editHeight: 'auto'
    },
    { 
      id: 'bio', 
      title: 'about me', 
      icon: Coffee,
      gridClass: 'col-span-1 row-span-2',
      editHeight: 'auto'
    },
    { 
      id: 'instagram', 
      title: 'instagram', 
      icon: Instagram,
      gridClass: 'col-span-1 row-span-1',
      editHeight: 'auto'
    },
    { 
      id: 'interests', 
      title: 'interests', 
      icon: Palette,
      gridClass: 'col-span-2 row-span-1',
      editHeight: 'auto'
    },
    { 
      id: 'lookingFor', 
      title: 'looking for', 
      icon: Dumbbell,
      gridClass: 'col-span-2 row-span-1',
      editHeight: 'auto'
    },
    { 
      id: 'music', 
      title: 'music', 
      icon: Music,
      gridClass: 'col-span-1 row-span-1',
      editHeight: 'auto'
    },
    { 
      id: 'food', 
      title: 'food', 
      icon: Utensils,
      gridClass: 'col-span-1 row-span-1',
      editHeight: 'auto'
    },
    { 
      id: 'activity', 
      title: 'favorite activity', 
      icon: Dumbbell,
      gridClass: 'col-span-2 row-span-1',
      editHeight: 'auto'
    }
  ];

  const handleSectionClick = (section) => {
    if (editingSection) return;

    const sectionEl = sectionRefs.current[section.id];
    if (!sectionEl) return;

    const sectionRect = sectionEl.getBoundingClientRect();
    
    const sectionCenterX = sectionRect.left + sectionRect.width / 2;
    const sectionCenterY = sectionRect.top + sectionRect.height / 2;
    
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    
    const scale = 2;
    
    const translateX = (viewportCenterX - sectionCenterX) / scale;
    const translateY = (viewportCenterY - sectionCenterY) / scale;

    setZoomTransform({ scale, x: translateX, y: translateY });

    setEditValues({
      name: profile.name,
      year: profile.year,
      major: profile.major,
      instagram: profile.instagram,
      bio: profile.bio,
      interests: [...profile.interests],
      lookingFor: [...profile.lookingFor],
      music: profile.favorites.music,
      food: profile.favorites.food,
      activity: profile.favorites.activity
    });

    setTimeout(() => setEditingSection(section.id), 400);
  };

  const handleSave = () => {
    const updated = { ...profile };
    
    if (editingSection === 'basic') {
      updated.name = editValues.name;
      updated.year = editValues.year;
      updated.major = editValues.major;
    } else if (editingSection === 'instagram') {
      updated.instagram = editValues.instagram;
    } else if (editingSection === 'bio') {
      updated.bio = editValues.bio;
    } else if (editingSection === 'interests') {
      updated.interests = editValues.interests;
    } else if (editingSection === 'lookingFor') {
      updated.lookingFor = editValues.lookingFor;
    } else if (editingSection === 'music') {
      updated.favorites.music = editValues.music;
    } else if (editingSection === 'food') {
      updated.favorites.food = editValues.food;
    } else if (editingSection === 'activity') {
      updated.favorites.activity = editValues.activity;
    }
    
    setProfile(updated);
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
    if (newInterestTag.trim() && !editValues.interests.includes(newInterestTag.trim())) {
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
    if (newLookingForTag.trim() && !editValues.lookingFor.includes(newLookingForTag.trim())) {
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

  const renderSectionContent = (section) => {
    const isEditing = editingSection === section.id;

    if (!isEditing) {
      switch (section.id) {
        case 'basic':
          return (
            <div className="space-y-1">
              <p className="font-bold text-base leading-tight text-gray-900">{profile.name}</p>
              <p className="text-sm text-gray-700 leading-tight">{profile.year} • {profile.major}</p>
            </div>
          );
        case 'instagram':
          return <p className="text-sm text-gray-800">{profile.instagram}</p>;
        case 'bio':
          return <p className="text-sm text-gray-800 leading-relaxed">{profile.bio}</p>;
        case 'interests':
          return (
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((interest, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full text-xs text-gray-800 font-medium tag-gradient">
                  {interest}
                </span>
              ))}
            </div>
          );
        case 'lookingFor':
          return (
            <div className="flex flex-wrap gap-1.5">
              {profile.lookingFor.map((item, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium text-gray-800 tag-gradient">
                  {item}
                </span>
              ))}
            </div>
          );
        case 'music':
          return <p className="text-sm text-gray-800 leading-relaxed">{profile.favorites.music}</p>;
        case 'food':
          return <p className="text-sm text-gray-800 leading-relaxed">{profile.favorites.food}</p>;
        case 'activity':
          return <p className="text-sm text-gray-800 leading-relaxed">{profile.favorites.activity}</p>;
        default:
          return null;
      }
    }

    switch (section.id) {
      case 'basic':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={editValues.name}
              onChange={(e) => setEditValues({...editValues, name: e.target.value})}
              placeholder="name"
              className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 text-gray-900 text-sm bg-white"
            />
            <input
              type="text"
              value={editValues.year}
              onChange={(e) => setEditValues({...editValues, year: e.target.value})}
              placeholder="year"
              className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 text-gray-900 text-sm bg-white"
            />
            <input
              type="text"
              value={editValues.major}
              onChange={(e) => setEditValues({...editValues, major: e.target.value})}
              placeholder="major"
              className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 text-gray-900 text-sm bg-white"
            />
          </div>
        );
      
      case 'instagram':
        return (
          <input
            type="text"
            value={editValues.instagram}
            onChange={(e) => setEditValues({...editValues, instagram: e.target.value})}
            placeholder="@username"
            className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 text-gray-900 text-sm bg-white"
          />
        );
      
      case 'bio':
        return (
          <textarea
            value={editValues.bio}
            onChange={(e) => setEditValues({...editValues, bio: e.target.value})}
            placeholder="tell us about yourself..."
            rows={4}
            className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 text-gray-900 resize-none text-sm bg-white"
          />
        );
      
      case 'interests':
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newInterestTag}
                onChange={(e) => setNewInterestTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInterestTag()}
                placeholder="add an interest (e.g., hiking)"
                className="flex-1 px-3 py-2 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 text-gray-900 text-sm bg-white"
              />
              <button
                onClick={addInterestTag}
                className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editValues.interests.map((tag, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-800 flex items-center gap-2 tag-gradient"
                >
                  {tag}
                  <button
                    onClick={() => removeInterestTag(tag)}
                    className="hover:bg-white/90 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        );
      
      case 'lookingFor':
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newLookingForTag}
                onChange={(e) => setNewLookingForTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addLookingForTag()}
                placeholder="add a tag (e.g., study buddy)"
                className="flex-1 px-3 py-2 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 text-gray-900 text-sm bg-white"
              />
              <button
                onClick={addLookingForTag}
                className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editValues.lookingFor.map((tag, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-800 flex items-center gap-2 tag-gradient"
                >
                  {tag}
                  <button
                    onClick={() => removeLookingForTag(tag)}
                    className="hover:bg-white/90 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        );
      
      case 'music':
        return (
          <input
            type="text"
            value={editValues.music}
            onChange={(e) => setEditValues({...editValues, music: e.target.value})}
            placeholder="favorite artists"
            className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 text-gray-900 text-sm bg-white"
          />
        );
      
      case 'food':
        return (
          <input
            type="text"
            value={editValues.food}
            onChange={(e) => setEditValues({...editValues, food: e.target.value})}
            placeholder="favorite foods"
            className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 text-gray-900 text-sm bg-white"
          />
        );
      
      case 'activity':
        return (
          <input
            type="text"
            value={editValues.activity}
            onChange={(e) => setEditValues({...editValues, activity: e.target.value})}
            placeholder="favorite activities"
            className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 text-gray-900 text-sm bg-white"
          />
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
      
      <div className="relative w-full h-screen bg-gradient-animated overflow-hidden flex items-center justify-center" style={{ fontFamily: 'Merriweather, serif' }}>
        <div 
          ref={containerRef}
          className="transition-transform duration-500 ease-out"
          style={{
            transform: `scale(${zoomTransform.scale}) translate(${zoomTransform.x}px, ${zoomTransform.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          <div className="w-full max-w-[550px] px-4">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">your profile</h1>
              <p className="text-gray-700 mt-2 text-sm">click any section to edit</p>
            </div>

            <div className="grid grid-cols-2 gap-3 auto-rows-auto">
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
                      backdrop-blur-md bg-white/50 rounded-xl p-4 border-2 border-white/70 transition-all duration-300 flex flex-col overflow-visible
                    `}
                    style={{
                      minHeight: '80px',
                      zIndex: isEditing ? 50 : 1
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {section.title}
                      </span>
                      {section.icon && <section.icon size={14} className="text-gray-600" />}
                    </div>
                    
                    <div className="flex-1 flex items-start overflow-visible">
                      {renderSectionContent(section)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {editingSection && (
          <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-4 z-50 fade-in">
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-all duration-300 shadow-2xl text-sm"
            >
              save changes
            </button>
            <button
              onClick={handleCancel}
              className="px-8 py-3 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-all duration-300 border-2 border-gray-400 shadow-2xl text-sm"
            >
              cancel
            </button>
          </div>
        )}

        <style>{`
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