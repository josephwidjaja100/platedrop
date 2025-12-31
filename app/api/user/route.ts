import { NextRequest, NextResponse } from 'next/server';
import NextAuth, { User as NextAuthUser } from "next-auth"
import { auth } from "@/auth";
import client from '@/lib/db';
import { validateProfileDataWithImage } from '@/lib/validation/userProfile-validation';
import { put } from '@vercel/blob';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    await client.connect();
    const db = client.db('platedrop');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
      { email: session.user.email },
      { 
        projection: { 
          _id: 1,
          profile: 1,
          email: 1,
          onboardingCompleted: 1
        } 
      }
    );

    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          _id: null,
          profile: {
            name: session.user.name || '',
            year: '',
            major: '',
            instagram: '',
            photo: null,
            gender: '',
            ethnicity: [],
            lookingForGender: [],
            lookingForEthnicity: [],
            optInMatching: false,
            attractiveness: 0,
            onboardingCompleted: false,
            adjectivePreferences: []
          },
          email: session.user.email,
          onboardingCompleted: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        profile: user.profile || {
          name: session.user.name || '',
          year: '',
          major: '',
          instagram: '',
          photo: null,
          gender: '',
          ethnicity: [],
          lookingForGender: [],
          lookingForEthnicity: [],
          optInMatching: false,
          attractiveness: 0,
          onboardingCompleted: false,
          adjectivePreferences: []
        },
        email: user.email || session.user.email,
        onboardingCompleted: user.onboardingCompleted || false
      }
    });

  } catch (error) {
    console.error('error fetching user profile:', error);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Check if request is FormData (with image) or JSON
    const contentType = request.headers.get('content-type');
    let requestData: any;
    let imageFile: File | null = null;

    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData for image uploads
      const formData = await request.formData();
      
      requestData = {
        name: formData.get('name') as string,
        year: formData.get('year') as string,
        major: formData.get('major') as string,
        instagram: formData.get('instagram') as string,
        gender: formData.get('gender') as string,
        ethnicity: JSON.parse(formData.get('ethnicity') as string || '[]'),
        lookingForGender: JSON.parse(formData.get('lookingForGender') as string || '[]'),
        lookingForEthnicity: JSON.parse(formData.get('lookingForEthnicity') as string || '[]'),
        optInMatching: formData.get('optInMatching') === 'true',
        attractiveness: parseInt(formData.get('attractiveness') as string || '0', 10),
      };

      imageFile = formData.get('photo') as File;

      // Handle case where no file is selected (FormData returns empty File)
      if (imageFile && imageFile.size === 0) {
        imageFile = null;
      }
    } else {
      // Handle JSON for regular profile updates
      requestData = await request.json();
    }

    // Extract onboarding fields before validation (they're optional)
    const onboardingCompleted = requestData.onboardingCompleted;
    const adjectivePreferences = requestData.adjectivePreferences;

    // Server-side validation (only if we have profile data to validate)
    // Skip validation if this is just an onboarding update
    let validData: any = null;
    let validImage: File | null = null;
    
    if (requestData.name || requestData.year || requestData.major || imageFile) {
      const validation = validateProfileDataWithImage(requestData, imageFile);
      if (!validation.isValid) {
        console.error('validation failed:', validation.error);
        console.error('request data:', requestData);
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      validData = validation.validData!;
      validImage = validation.validImage;
    } else if (onboardingCompleted === undefined && adjectivePreferences === undefined) {
      // No profile data and no onboarding data - invalid request
      return NextResponse.json({ error: 'no data provided' }, { status: 400 });
    }

    await client.connect();
    const db = client.db('platedrop');
    const usersCollection = db.collection('users');

    // Structure data according to User interface
    const profileUpdate: { [key: string]: any } = {};
    
    // Only update profile fields if we have valid data
    if (validData) {
      profileUpdate.name = validData.name;
      profileUpdate.year = validData.year;
      profileUpdate.major = validData.major;
      profileUpdate.instagram = validData.instagram || '';
      profileUpdate.gender = validData.gender;
      profileUpdate.ethnicity = validData.ethnicity;
      profileUpdate.lookingForGender = validData.lookingForGender;
      profileUpdate.lookingForEthnicity = validData.lookingForEthnicity;
      profileUpdate.photo = validData.photo;
      profileUpdate.optInMatching = validData.optInMatching;
      profileUpdate.attractiveness = validData.attractiveness;
    }

    // Handle onboarding fields if provided (always update these)
    if (onboardingCompleted !== undefined) {
      profileUpdate.onboardingCompleted = onboardingCompleted;
    }
    if (adjectivePreferences !== undefined) {
      profileUpdate.adjectivePreferences = adjectivePreferences;
    }

    // Handle profile image upload
    if (validImage) {
      try {
        const blob = await put(
          `userimages/${Date.now()}-${session.user.email}-profile.jpg`, 
          validImage, 
          { access: 'public' }
        );
        
        profileUpdate.photo = blob.url;
        // console.log(`profile image uploaded to vercel blob: ${blob.url}`);
      } catch (error) {
        console.error('error uploading profile image to vercel blob:', error);
        return NextResponse.json({ error: 'failed to upload profile image to storage' }, { status: 500 });
      }
    }

    // Structure the update object correctly
    // If we only have onboarding fields, update them directly on profile
    // Otherwise, update the entire profile object
    const updateData: { [key: string]: any } = {
      updatedAt: new Date()
    };
    
    if (Object.keys(profileUpdate).length > 0) {
      // Get existing profile to merge with new data
      const existingUser = await usersCollection.findOne(
        { email: session.user.email },
        { projection: { profile: 1 } }
      );
      
      const existingProfile = existingUser?.profile || {};
      updateData.profile = { ...existingProfile, ...profileUpdate };
    }

    const result = await usersCollection.updateOne(
      { email: session.user.email },
      { $set: updateData },
      { upsert: true }
    );

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return NextResponse.json({ error: 'failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'profile updated successfully',
      data: { 
        profile: profileUpdate
      }
    });

  } catch (error) {
    console.error('error updating user profile:', error);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}