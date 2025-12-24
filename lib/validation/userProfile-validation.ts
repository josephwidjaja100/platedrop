export const GENDER_OPTIONS = [
  'male', 'female', 'non-binary'
] as const;

export const YEAR_OPTIONS = [
  'freshman', 'sophomore', 'junior', 'senior', 'grad student'
] as const;

export const ETHNICITY_OPTIONS = [
  'prefer not to answer',
  'african',
  'east asian',
  'south asian',
  'southeast asian',
  'black / african american',
  'hispanic / latinx',
  'middle eastern / north african',
  'native american / alaskan native',
  'native hawaiian / pacific islander',
  'white'
] as const;

export const MAJOR_OPTIONS = [
  "aeronautics and astronautics",
  "african and african american studies",
  "african studies",
  "american studies",
  "anthropology",
  "applied physics",
  "archaeology",
  "art history",
  "art practice",
  "asian american studies",
  "atmosphere / energy",
  "bioengineering",
  "biology",
  "biomechanical engineering",
  "biomedical computation",
  "chemical engineering",
  "chemistry",
  "chicana/o - latina/o studies",
  "china studies",
  "civil engineering",
  "classics",
  "communication",
  "community health and prevention research",
  "comparative literature",
  "comparative studies in race and ethnicity",
  "computer science",
  "creative writing",
  "dance (taps minor)",
  "data science",
  "data science & social systems",
  "democracy, development, and the rule of law",
  "design",
  "digital humanities",
  "earth and planetary sciences",
  "earth systems",
  "east asian studies",
  "economics",
  "education",
  "electrical engineering",
  "energy science and engineering",
  "engineering physics",
  "english",
  "environmental systems engineering",
  "ethics in society",
  "european studies",
  "feminist, gender, and sexuality studies",
  "film and media studies",
  "french",
  "geophysics",
  "german studies",
  "global studies",
  "history",
  "honors in the arts",
  "human biology",
  "human rights",
  "iberian and latin american cultures",
  "international policy studies",
  "international relations",
  "international security studies",
  "iranian studies",
  "islamic studies",
  "italian",
  "japanese",
  "jewish studies",
  "korean",
  "laboratory animal science",
  "latin american studies",
  "linguistics",
  "management science and engineering",
  "materials science and engineering",
  "mathematical and computational science",
  "mathematics",
  "mechanical engineering",
  "medieval studies",
  "middle eastern language, literature and culture",
  "modern languages",
  "modern thought and literature",
  "music",
  "music, science, and technology",
  "native american studies",
  "philosophy",
  "philosophy and religious studies",
  "physics",
  "political science",
  "portuguese",
  "psychology",
  "public policy",
  "religious studies",
  "science, technology, and society",
  "slavic languages and literatures",
  "sociology",
  "south asian studies",
  "spanish",
  "statistics",
  "sustainability",
  "sustainable architecture + engineering",
  "symbolic systems",
  "theater and performance studies",
  "translation studies",
  "urban studies"
] as const;

export const CHARACTER_LIMITS = {
  nameMin: 1,
  nameMax: 50,
  instagramMax: 30,
} as const;

export const IMAGE_LIMITS = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,
} as const;

export const ATTRACTIVENESS_LIMITS = {
  min: 0,
  max: 100,
} as const;

export interface UserProfileData {
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
}

export interface ProfileImageData {
  file: File;
  isValid: boolean;
  error?: string;
}

// Validation functions
export function validateName(name: string): { isValid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'all basic info must be filled' };
  }
  
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'name cannot be empty' };
  }
  
  if (trimmed.length > CHARACTER_LIMITS.nameMax) {
    return { isValid: false, error: `name cannot exceed ${CHARACTER_LIMITS.nameMax} characters` };
  }
  
  return { isValid: true };
}

export function validateYear(year: string): { isValid: boolean; error?: string } {
  if (!year) {
    return { isValid: false, error: 'all basic info must be filled' };
  }
  
  if (!YEAR_OPTIONS.includes(year as any)) {
    return { isValid: false, error: 'invalid year selection' };
  }
  
  return { isValid: true };
}

export function validateMajor(major: string): { isValid: boolean; error?: string } {
  if (!major) {
    return { isValid: false, error: 'all basic info must be filled' };
  }
  
  if (!MAJOR_OPTIONS.includes(major as any)) {
    return { isValid: false, error: 'invalid major selection' };
  }
  
  return { isValid: true };
}

export function validateInstagram(instagram: string): { isValid: boolean; error?: string } {
  if (!instagram) {
    return { isValid: true }; // Instagram is optional
  }
  
  if (typeof instagram !== 'string') {
    return { isValid: false, error: 'invalid instagram username' };
  }
  
  const trimmed = instagram.trim();
  
  if (trimmed.length > CHARACTER_LIMITS.instagramMax) {
    return { isValid: false, error: `instagram username cannot exceed ${CHARACTER_LIMITS.instagramMax} characters` };
  }
  
  // Instagram username rules: letters, numbers, periods, and underscores only
  if (!/^[a-zA-Z0-9_.]+$/.test(trimmed)) {
    return { isValid: false, error: 'instagram username can only contain letters, numbers, periods, and underscores' };
  }
  
  return { isValid: true };
}

export function validateGender(gender: string): { isValid: boolean; error?: string } {
  if (!gender) {
    return { isValid: false, error: 'all basic info must be filled' };
  }
  
  if (!GENDER_OPTIONS.includes(gender as any)) {
    return { isValid: false, error: 'invalid gender selection' };
  }
  
  return { isValid: true };
}

export function validateEthnicity(ethnicity: string[]): { isValid: boolean; error?: string } {
  if (!ethnicity || !Array.isArray(ethnicity)) {
    return { isValid: false, error: 'ethnicity must be an array' };
  }
  
  if (ethnicity.length === 0) {
    return { isValid: false, error: 'at least one ethnicity must be selected' };
  }
  
  // Check if all values are valid
  for (const eth of ethnicity) {
    if (!ETHNICITY_OPTIONS.includes(eth as any)) {
      return { isValid: false, error: 'invalid ethnicity selection' };
    }
  }
  
  return { isValid: true };
}

export function validateLookingForGender(genders: string[]): { isValid: boolean; error?: string } {
  if (!genders || !Array.isArray(genders)) {
    return { isValid: false, error: 'looking for gender must be an array' };
  }
  
  // Empty array is valid (means "any gender")
  if (genders.length === 0) {
    return { isValid: true };
  }
  
  // Check if all values are valid
  for (const gender of genders) {
    if (!GENDER_OPTIONS.includes(gender as any)) {
      return { isValid: false, error: 'invalid gender preference' };
    }
  }
  
  return { isValid: true };
}

export function validateLookingForEthnicity(ethnicities: string[]): { isValid: boolean; error?: string } {
  if (!ethnicities || !Array.isArray(ethnicities)) {
    return { isValid: false, error: 'looking for ethnicity must be an array' };
  }
  
  // Empty array is valid (means "any ethnicity")
  if (ethnicities.length === 0) {
    return { isValid: true };
  }
  
  // Check if all values are valid
  for (const eth of ethnicities) {
    if (!ETHNICITY_OPTIONS.includes(eth as any)) {
      return { isValid: false, error: 'invalid ethnicity preference' };
    }
  }
  
  return { isValid: true };
}

export function validateAttractiveness(attractiveness: any): { isValid: boolean; error?: string } {
  // Check if it's a number
  if (typeof attractiveness !== 'number') {
    // Try to parse it if it's a string
    if (typeof attractiveness === 'string') {
      const parsed = parseFloat(attractiveness);
      if (isNaN(parsed)) {
        return { isValid: false, error: 'attractiveness must be a number' };
      }
      attractiveness = parsed;
    } else {
      return { isValid: false, error: 'attractiveness must be a number' };
    }
  }

  // Check if it's finite (not NaN, Infinity, or -Infinity)
  if (!isFinite(attractiveness)) {
    return { isValid: false, error: 'attractiveness must be a valid number' };
  }

  // Check range
  if (attractiveness < ATTRACTIVENESS_LIMITS.min || attractiveness > ATTRACTIVENESS_LIMITS.max) {
    return { 
      isValid: false, 
      error: `attractiveness must be between ${ATTRACTIVENESS_LIMITS.min} and ${ATTRACTIVENESS_LIMITS.max}` 
    };
  }

  return { isValid: true };
}

export function validateOptInMatching(optInMatching: any): { isValid: boolean; error?: string } {
  if (typeof optInMatching !== 'boolean') {
    // Try to convert string representations
    if (optInMatching === 'true' || optInMatching === true) {
      return { isValid: true };
    }
    if (optInMatching === 'false' || optInMatching === false) {
      return { isValid: true };
    }
    
    return { isValid: false, error: 'opt in matching must be a boolean value' };
  }

  return { isValid: true };
}

export function validateProfileImage(file: File | null): { isValid: boolean; error?: string; validFile?: File } {
  if (!file) {
    return { isValid: true }; // Image is optional
  }

  // Check if it's actually a File object
  if (!(file instanceof File)) {
    return { isValid: false, error: 'invalid file object' };
  }

  // Check file size
  if (file.size === 0) {
    return { isValid: false, error: 'image file is empty' };
  }

  if (file.size > IMAGE_LIMITS.maxSize) {
    const maxSizeMB = IMAGE_LIMITS.maxSize / (1024 * 1024);
    return { isValid: false, error: `image file must be less than ${maxSizeMB}MB` };
  }

  // Check file type
  if (!file.type) {
    return { isValid: false, error: 'unable to determine file type' };
  }

  if (!IMAGE_LIMITS.allowedTypes.includes(file.type as any)) {
    const allowedTypesString = IMAGE_LIMITS.allowedTypes
      .map(type => type.replace('image/', '').toUpperCase())
      .join(', ');
    return { isValid: false, error: `image must be one of: ${allowedTypesString}` };
  }

  // Check file name
  if (!file.name || file.name.trim() === '') {
    return { isValid: false, error: 'image file must have a valid name' };
  }

  // Check for valid file extensions
  const fileName = file.name.toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    return { isValid: false, error: 'image file must have a valid extension (.jpg, .png, .webp)' };
  }

  // Ensure MIME type matches extension
  const extension = fileName.split('.').pop();
  const expectedMimeTypes: { [key: string]: string[] } = {
    'jpg': ['image/jpeg'],
    'jpeg': ['image/jpeg'],
    'png': ['image/png'],
    'webp': ['image/webp']
  };

  if (extension && expectedMimeTypes[extension]) {
    if (!expectedMimeTypes[extension].includes(file.type)) {
      return { isValid: false, error: 'file type does not match file extension' };
    }
  }

  return { isValid: true, validFile: file };
}

export function validateProfileData(data: any): { isValid: boolean; error?: string; validData?: UserProfileData } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'invalid profile data' };
  }
  
  // Validate name (required)
  const nameValidation = validateName(data.name);
  if (!nameValidation.isValid) {
    return nameValidation;
  }
  
  // Validate year (required)
  const yearValidation = validateYear(data.year);
  if (!yearValidation.isValid) {
    return yearValidation;
  }
  
  // Validate major (required)
  const majorValidation = validateMajor(data.major);
  if (!majorValidation.isValid) {
    return majorValidation;
  }
  
  // Validate instagram (optional)
  const instagramValidation = validateInstagram(data.instagram || '');
  if (!instagramValidation.isValid) {
    return instagramValidation;
  }
  
  // Validate gender (required)
  const genderValidation = validateGender(data.gender);
  if (!genderValidation.isValid) {
    return genderValidation;
  }
  
  // Validate ethnicity (required)
  const ethnicityValidation = validateEthnicity(data.ethnicity);
  if (!ethnicityValidation.isValid) {
    return ethnicityValidation;
  }
  
  // Validate looking for gender (optional, but must be valid array)
  const lookingForGenderValidation = validateLookingForGender(data.lookingForGender || []);
  if (!lookingForGenderValidation.isValid) {
    return lookingForGenderValidation;
  }
  
  // Validate looking for ethnicity (optional, but must be valid array)
  const lookingForEthnicityValidation = validateLookingForEthnicity(data.lookingForEthnicity || []);
  if (!lookingForEthnicityValidation.isValid) {
    return lookingForEthnicityValidation;
  }

  // Validate attractiveness (required)
  const attractivenessValidation = validateAttractiveness(data.attractiveness ?? 0);
  if (!attractivenessValidation.isValid) {
    return attractivenessValidation;
  }

  // Validate opt in matching (required)
  const optInMatchingValidation = validateOptInMatching(data.optInMatching ?? false);
  if (!optInMatchingValidation.isValid) {
    return optInMatchingValidation;
  }
  
  const validData: UserProfileData = {
    name: data.name.trim(),
    year: data.year,
    major: data.major,
    instagram: data.instagram?.trim() || '',
    photo: data.photo || null,
    gender: data.gender,
    ethnicity: data.ethnicity,
    lookingForGender: data.lookingForGender || [],
    lookingForEthnicity: data.lookingForEthnicity || [],
    attractiveness: typeof data.attractiveness === 'string' ? parseFloat(data.attractiveness) : (data.attractiveness || 0),
    optInMatching: data.optInMatching === 'true' || data.optInMatching === true
  };
  
  return { isValid: true, validData };
}

export function validateProfileDataWithImage(
  data: any, 
  imageFile?: File | null
): { 
  isValid: boolean; 
  error?: string; 
  validData?: UserProfileData;
  validImage?: File;
} {
  // First validate the profile data
  const profileValidation = validateProfileData(data);
  if (!profileValidation.isValid) {
    return profileValidation;
  }

  // Then validate the image if provided
  if (imageFile) {
    const imageValidation = validateProfileImage(imageFile);
    if (!imageValidation.isValid) {
      return { isValid: false, error: imageValidation.error };
    }

    return {
      isValid: true,
      validData: profileValidation.validData,
      validImage: imageValidation.validFile
    };
  }

  return {
    isValid: true,
    validData: profileValidation.validData
  };
}

// Helper function to get human-readable file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}