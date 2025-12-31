"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Instagram, User, Camera, Upload, X, Heart, Target } from 'lucide-react';
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Dropdown from '@/components/Dropdown';
import MultiselectDropdown from '@/components/MultiselectDropdown';
import PhotoEditor from '@/components/PhotoEditor';
import AdjectiveSelection from '@/components/AdjectiveSelection';
import { validateProfileDataWithImage } from '@/lib/validation/userProfile-validation';

const Profile = () => {
  const { data: session, status } = useSession();
  type ProfileData = {
    name: string;
    year: string;
    major: string;
    instagram: string;
    photo: string | null;
    gender: string;
    ethnicity: string[];
    lookingForGender: string[];
    lookingForEthnicity: string[];
    attractiveness: number;
    optInMatching: boolean;
  };

  type Section = {
    id: string;
    title: string;
    icon?: any;
    gridClass: string;
  };

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [zoomTransform, setZoomTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showAdjectiveSelection, setShowAdjectiveSelection] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    year: '',
    major: '',
    instagram: '',
    photo: null,
    gender: '', 
    ethnicity: [], 
    lookingForGender: [],
    lookingForEthnicity: [],
    attractiveness: 0,
    optInMatching: false
  });

  const [editValues, setEditValues] = useState<ProfileData>({
    name: '',
    year: '',
    major: '',
    instagram: '',
    photo: null,
    gender: '',
    ethnicity: [],
    lookingForGender: [],
    lookingForEthnicity: [],
    attractiveness: 0,
    optInMatching: false
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const genderOptions = ['male', 'female', 'non-binary'];
  const yearOptions = ['freshman', 'sophomore', 'junior', 'senior', 'grad student'];
  const majorOptions = ["aeronautics and astronautics", "african and african american studies", "african studies", "american studies", "anthropology", "applied physics", "archaeology", "art history", "art practice", "asian american studies", "atmosphere / energy", "bioengineering", "biology", "biomechanical engineering", "biomedical computation", "chemical engineering", "chemistry", "chicana/o - latina/o studies", "china studies", "civil engineering", "classics", "communication", "community health and prevention research", "comparative literature", "comparative studies in race and ethnicity", "computer science", "creative writing", "dance (taps minor)", "data science", "data science & social systems", "democracy, development, and the rule of law", "design", "digital humanities", "earth and planetary sciences", "earth systems", "east asian studies", "economics", "education", "electrical engineering", "energy science and engineering", "engineering physics", "english", "environmental systems engineering", "ethics in society", "european studies", "feminist, gender, and sexuality studies", "film and media studies", "french", "geophysics", "german studies", "global studies", "history", "honors in the arts", "human biology", "human rights", "iberian and latin american cultures", "international policy studies", "international relations", "international security studies", "iranian studies", "islamic studies", "italian", "japanese", "jewish studies", "korean", "laboratory animal science", "latin american studies", "linguistics", "management science and engineering", "materials science and engineering", "mathematical and computational science", "mathematics", "mechanical engineering", "medieval studies", "middle eastern language, literature and culture", "modern languages", "modern thought and literature", "music", "music, science, and technology", "native american studies", "philosophy", "philosophy and religious studies", "physics", "political science", "portuguese", "psychology", "public policy", "religious studies", "science, technology, and society", "slavic languages and literatures", "sociology", "south asian studies", "spanish", "statistics", "sustainability", "sustainable architecture + engineering", "symbolic systems", "theater and performance studies", "translation studies", "urban studies"];
  const ethnicityOptions = ['prefer not to answer', 'african', 'east asian', 'south asian', 'southeast asian', 'black / african american', 'hispanic / latinx', 'middle eastern / north african', 'native american / alaskan native', 'native hawaiian / pacific islander', 'white'];

  const areRequiredSectionsFilled = (data: ProfileData) => {
    const { name, year, major, instagram, gender, ethnicity, photo } = data;
    return name && year && major && gender && ethnicity.length > 0 && instagram && photo;
  };

  const mobileSections = [
    { 
      id: 'basic', 
      title: 'basic info', 
      icon: User,
      gridClass: 'col-span-1 row-span-2',
    },
    { 
      id: 'instagram', 
      title: 'instagram', 
      icon: Instagram,
      gridClass: 'col-span-1 row-span-1',
    },
    { 
      id: 'optInMatching', 
      title: 'matching', 
      icon: Heart,
      gridClass: 'col-span-1 row-span-1',
    },
    { 
      id: 'lookingFor', 
      title: 'looking for', 
      icon: Target,
      gridClass: 'col-span-2 row-span-2',
    },
    { 
      id: 'photo', 
      title: 'photo', 
      icon: Camera,
      gridClass: 'col-span-2 row-span-4',
    }
  ];

  const desktopSections = [
    { 
      id: 'basic', 
      title: 'basic info', 
      icon: User,
      gridClass: 'col-span-2 row-span-2',
    },
    { 
      id: 'instagram', 
      title: 'instagram', 
      icon: Instagram,
      gridClass: 'col-span-2 row-span-1',
    },
    { 
      id: 'optInMatching', 
      title: 'matching', 
      icon: Heart,
      gridClass: 'col-span-2 row-span-1',
    },
    { 
      id: 'photo', 
      title: 'photo', 
      icon: Camera,
      gridClass: 'col-span-4 row-span-4 col-start-5 row-start-1',
    },
    { 
      id: 'lookingFor', 
      title: 'looking for', 
      icon: Target,
      gridClass: 'col-span-4 row-span-2 col-start-1 row-start-3',
    }
  ];

  const profileSections = isMobile ? mobileSections : desktopSections;

  useEffect(() => {
    const loadUserData = async () => {
      if (status !== "authenticated" || !session) return;

      try {
        setLoading(true);

        const response = await fetch("/api/user");

        if (!response.ok) {
          throw new Error("failed to fetch user data");
        }

        const result = await response.json();
        const data = result.data;

        if (data?.profile) {
          const profileData = {
            name: data.profile.name || '',
            year: data.profile.year || '',
            major: data.profile.major || '',
            instagram: data.profile.instagram || '',
            photo: data.profile.photo || null,
            gender: data.profile.gender || '',
            ethnicity: data.profile.ethnicity || [],
            lookingForGender: data.profile.lookingForGender || [],
            lookingForEthnicity: data.profile.lookingForEthnicity || [],
            attractiveness: data.profile.attractiveness || 0,
            optInMatching: data.profile.optInMatching || false
          };
          setProfile(profileData);
          
          // Check if user has basic info filled
          const hasBasic = profileData.name && profileData.year && profileData.major && 
                          profileData.gender && profileData.ethnicity.length > 0;
          
          // Check onboarding status
          const completed = data.onboardingCompleted || data.profile.onboardingCompleted || false;
          setOnboardingCompleted(completed);
          
          // Show adjective selection if user has basic info but hasn't completed onboarding
          if (hasBasic && !completed) {
            setShowAdjectiveSelection(true);
          }
        }
        setDataLoaded(true);
      } catch (error) {
        console.error("failed to load user data:", error);
        toast.error("failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [status, session]);

  const handleSectionClick = (section: Section) => {
    if (editingSection) return;

    const sectionEl = sectionRefs.current[section.id];
    if (!sectionEl) return;

    const sectionRect = sectionEl.getBoundingClientRect();
    
    const buttonAreaHeight = 250;
    const topPadding = 20;
    
    const availableHeight = window.innerHeight - buttonAreaHeight - topPadding;
    const targetY = topPadding + availableHeight / 2;
    
    const sectionCenterX = sectionRect.left + sectionRect.width / 2;
    const sectionCenterY = sectionRect.top + sectionRect.height / 2;
    
    const viewportCenterX = window.innerWidth / 2;
    
    const scale = isMobile ? 1 : 1.5; 
    
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
      lookingForEthnicity: [...profile.lookingForEthnicity],
      attractiveness: profile.attractiveness,
      optInMatching: profile.optInMatching
    });

    setProfileImageFile(null);
    setEditingSection(section.id);
  };

  const handleSave = async () => {
    if (status !== "authenticated" || !session) {
      toast.error("you must be logged in to save changes");
      return;
    }

    const validation = validateProfileDataWithImage(editValues, profileImageFile);
    if (!validation.isValid) {
      toast.error(validation.error + (editingSection=="basic" ? "" : " before submitting " + editingSection));
      return;
    }

    if (editValues.optInMatching && !areRequiredSectionsFilled(editValues)) {
      const missingSections = [];
      if (!editValues.name) missingSections.push('name');
      if (!editValues.year) missingSections.push('year');
      if (!editValues.major) missingSections.push('major');
      if (!editValues.gender) missingSections.push('gender');
      if (editValues.ethnicity.length === 0) missingSections.push('ethnicity');
      if (!editValues.instagram) missingSections.push('instagram');
      if (!editValues.photo && !profileImageFile) missingSections.push('photo');
      
      toast.error(`cannot opt in to matching. please fill: ${missingSections.join(', ')}`);
      return;
    }

    setLoading(true);
    const shouldAnalyze = profileImageFile !== null;

    try {
      let response;

      if (profileImageFile) {
        const formData = new FormData();
        formData.append('name', editValues.name);
        formData.append('year', editValues.year);
        formData.append('major', editValues.major);
        formData.append('instagram', editValues.instagram || '');
        formData.append('gender', editValues.gender);
        formData.append('ethnicity', JSON.stringify(editValues.ethnicity));
        formData.append('lookingForGender', JSON.stringify(editValues.lookingForGender));
        formData.append('lookingForEthnicity', JSON.stringify(editValues.lookingForEthnicity));
        formData.append('optInMatching', editValues.optInMatching.toString());
        formData.append('photo', profileImageFile);
        formData.append('attractiveness', editValues.attractiveness.toString());

        response = await fetch("/api/user", {
          method: "PUT",
          body: formData,
        });
      } else {
        response = await fetch("/api/user", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editValues.name,
            year: editValues.year,
            major: editValues.major,
            instagram: editValues.instagram || '',
            gender: editValues.gender,
            ethnicity: editValues.ethnicity,
            lookingForGender: editValues.lookingForGender,
            lookingForEthnicity: editValues.lookingForEthnicity,
            optInMatching: editValues.optInMatching,
            photo: editValues.photo,
            attractiveness: editValues.attractiveness
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "failed to update profile");
      }

      const result = await response.json();
      
      if (result.data?.profile) {
        const updatedProfile = {
          name: result.data.profile.name || '',
          year: result.data.profile.year || '',
          major: result.data.profile.major || '',
          instagram: result.data.profile.instagram || '',
          photo: result.data.profile.photo || null,
          gender: result.data.profile.gender || '',
          ethnicity: result.data.profile.ethnicity || [],
          lookingForGender: result.data.profile.lookingForGender || [],
          lookingForEthnicity: result.data.profile.lookingForEthnicity || [],
          attractiveness: result.data.profile.attractiveness || 0,
          optInMatching: result.data.profile.optInMatching || false
        };
        setProfile(updatedProfile);
        
        // Check if user just filled basic info for the first time
        const hasBasic = updatedProfile.name && updatedProfile.year && updatedProfile.major && 
                        updatedProfile.gender && updatedProfile.ethnicity.length > 0;
        
        // Show adjective selection if user just saved basic info section and hasn't done onboarding
        // Only show if they actually have some basic info filled
        if (hasBasic && !onboardingCompleted && editingSection === 'basic') {
          // Small delay to let the save animation complete
          setTimeout(() => {
            setShowAdjectiveSelection(true);
          }, 500);
        }
      }

      if (shouldAnalyze && result.data?.profile?.photo) {
        toast.info("analyzing your photo...");
        
        const analyzeResponse = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: result.data.profile.photo
          }),
        });

        if (analyzeResponse.ok) {
          const analyzeResult = await analyzeResponse.json();
          setProfile(prev => ({
            ...prev,
            attractiveness: analyzeResult.data.attractiveness
          }));
          editValues.attractiveness = analyzeResult.data.attractiveness;
        }
        else{
          setProfile(prev => ({
            ...prev,
            attractiveness: 0
          }));
          editValues.attractiveness = 0;
        }
        toast.success("photo uploaded successfully!")
      }
      else{
        toast.success("profile updated successfully!");
      }

      setProfileImageFile(null);
      setEditingSection(null);
      setZoomTransform({ scale: 1, x: 0, y: 0 });
    } catch (err: unknown) {
      console.error("profile update error:", err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setZoomTransform({ scale: 1, x: 0, y: 0 });
    setProfileImageFile(null);
  };

  const handleToggleOptIn = () => {
    setEditValues({ ...editValues, optInMatching: !editValues.optInMatching });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string | null;
        if (result) {
          setTempImageUrl(result);
          setShowPhotoEditor(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoEditorSave = (croppedFile: File) => {
    setProfileImageFile(croppedFile);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string | null;
      setEditValues({
        ...editValues,
        photo: result
      });
    };
    reader.readAsDataURL(croppedFile);
    
    setShowPhotoEditor(false);
    setTempImageUrl(null);
  };

  const handlePhotoEditorCancel = () => {
    setShowPhotoEditor(false);
    setTempImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setEditValues({
      ...editValues,
      photo: null
    });
    setProfileImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAdjectiveSelectionComplete = async (selections: string[]) => {
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          year: profile.year,
          major: profile.major,
          instagram: profile.instagram || '',
          gender: profile.gender,
          ethnicity: profile.ethnicity,
          lookingForGender: profile.lookingForGender,
          lookingForEthnicity: profile.lookingForEthnicity,
          optInMatching: profile.optInMatching,
          photo: profile.photo,
          attractiveness: profile.attractiveness,
          onboardingCompleted: true,
          adjectivePreferences: selections
        }),
      });

      if (!response.ok) {
        throw new Error("failed to save preferences");
      }

      setOnboardingCompleted(true);
      setShowAdjectiveSelection(false);
      toast.success("preferences saved!");
    } catch (error) {
      console.error("error saving preferences:", error);
      toast.error("failed to save preferences");
    }
  };

  const handleAdjectiveSelectionSkip = () => {
    setShowAdjectiveSelection(false);
    setOnboardingCompleted(true);
  };

  const renderSectionContent = (section: Section) => {
    const isEditing = editingSection === section.id;
    const displayData = isEditing ? editValues : profile;

    if (!isEditing) {
      switch (section.id) {
        case 'basic':
          return (
            <div className="space-y-2">
              <p className={`font-bold text-lg leading-tight ${profile.name ? 'text-gray-900' : 'text-gray-400'}`}>
                {profile.name || 'name'}
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
                  {profile.year || 'year'}
                </span>
                <span className="text-gray-700"> • </span>
                <span className={profile.major ? 'text-gray-700' : 'text-gray-400'}>
                  {profile.major || 'major'}
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
                {profile.instagram || 'looks.matr'}
              </span>
            </p>
          );
        case 'optInMatching':
          return (
            <div className="flex items-center justify-between w-full gap-2">
              <p className="text-sm font-medium text-gray-800 flex-shrink min-w-0">
                {profile.optInMatching ? 'opted in to matching' : 'opted out of matching'}
              </p>
              <div className="relative w-12 h-7 flex items-center rounded-full flex-shrink-0 pointer-events-none">
                <div className={`absolute inset-0 w-12 h-7 rounded-full transition-colors duration-300 ${profile.optInMatching ? 'bg-gray-900' : 'bg-gray-300'}`} />
                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${profile.optInMatching ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          );
        case 'lookingFor':
          return (
            <div className="space-y-5">
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
                  className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-900 transition-colors shadow-lg"
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
      
      case 'optInMatching':
        return (
          <div className="flex items-center justify-between w-full gap-2">
            <p className="text-sm font-medium text-gray-800 flex-shrink min-w-0">
              {editValues.optInMatching ? 'opted in to matching' : 'opted out of matching'}
            </p>
            <button
              onClick={handleToggleOptIn}
              className="relative w-12 h-7 flex items-center rounded-full transition-colors duration-300 cursor-pointer flex-shrink-0"
            >
              <span className="sr-only">Opt in to matching</span>
              <div className={`absolute inset-0 w-12 h-7 rounded-full transition-colors duration-300 ${editValues.optInMatching ? 'bg-gray-900' : 'bg-gray-300'}`} />
              <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${editValues.optInMatching ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        );
      
      case 'lookingFor':
        return (
          <div className="w-full space-y-5">
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

  if (status === "loading" || (status === "authenticated" && !dataLoaded)) {
    return (
      <>
        <link 
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
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
        <div className="fixed inset-0 bg-gradient-animated flex items-center justify-center" style={{ fontFamily: 'Merriweather, serif' }}>
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-gray-800 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700">loading your profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <link 
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
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
        <div className="fixed inset-0 bg-gradient-animated flex items-center justify-center" style={{ fontFamily: 'Merriweather, serif' }}>
          <div className="text-center">
            <p className="text-gray-700 mb-4">please log in to access your profile</p>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-8 py-3 bg-gray-800 text-white font-bold rounded-full hover:bg-gray-700 transition-all duration-300"
            >
              go to login
            </button>
          </div>
        </div>
      </>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">your profile</h1>
              <p className="text-gray-700 mt-1.5 text-sm md:text-sm">click any section to edit</p>
            </div>

            <div 
              className={`
                ${isMobile ? `grid grid-cols-2 gap-3 ${editingSection ? 'mb-32' : 'mb-8'}` : 'grid grid-cols-8 gap-2 md:gap-3'} 
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
                    ref={(el) => { sectionRefs.current[section.id] = el; }}
                    onClick={() => !isEditing && handleSectionClick(section)}
                    className={`
                      ${section.gridClass}
                      ${isOtherEditing ? 'opacity-20 pointer-events-none' : ''}
                      ${!editingSection ? 'cursor-pointer hover:bg-white/70 hover:shadow-2xl hover:scale-[1.02]' : ''}
                      profile-card backdrop-blur-md bg-white/50 rounded-xl p-3 md:p-5 border-2 border-white/70 transition-all duration-300 flex flex-col overflow-visible
                    `}
                    style={{
                      zIndex: isEditing ? 50 : 1
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm md:text-sm font-bold text-gray-700 uppercase tracking-wider">
                        {section.title}
                      </span>
                      {section.icon && <section.icon size={14} className="text-gray-600" />}
                    </div>
                    
                    <div className="flex-1 flex items-center overflow-visible text-xs md:text-base min-h-0">
                      {renderSectionContent(section)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {editingSection && (
          <div className={`fixed ${isMobile ? 'bottom-4' : 'bottom-0'} left-0 right-0 flex justify-center gap-3 md:gap-5 fade-in px-safe ${isMobile ? 'pb-4' : 'pb-safe pt-4'} pointer-events-none z-[100]`}>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 md:px-8 py-2 md:py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-all duration-300 shadow-2xl text-sm md:text-base whitespace-nowrap pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'saving...' : 'save changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-6 md:px-8 py-2 md:py-3 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-all duration-300 border-2 border-gray-400 shadow-2xl text-sm md:text-base whitespace-nowrap pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              cancel
            </button>
          </div>
        )}

        {showPhotoEditor && tempImageUrl && (
          <PhotoEditor
            imageUrl={tempImageUrl}
            onSave={handlePhotoEditorSave}
            onCancel={handlePhotoEditorCancel}
          />
        )}

        {showAdjectiveSelection && (
          <AdjectiveSelection
            onComplete={handleAdjectiveSelectionComplete}
            onSkip={handleAdjectiveSelectionSkip}
          />
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
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
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
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
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