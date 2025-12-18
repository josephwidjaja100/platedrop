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
          email: 1
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
            lookingForEthnicity: []
          },
          email: session.user.email
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
          lookingForEthnicity: []
        },
        email: user.email || session.user.email
      }
    });

  } catch (error) {
    console.error('error fetching user profile:', error);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
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

    // Server-side validation
    const validation = validateProfileDataWithImage(requestData, imageFile);
    if (!validation.isValid) {
      console.error('validation failed:', validation.error);
      console.error('request data:', requestData);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const validData = validation.validData!;
    const validImage = validation.validImage;

    await client.connect();
    const db = client.db('platedrop');
    const usersCollection = db.collection('users');

    // Structure data according to User interface
    const profileUpdate: { [key: string]: any } = {
      name: validData.name,
      year: validData.year,
      major: validData.major,
      instagram: validData.instagram || '',
      gender: validData.gender,
      ethnicity: validData.ethnicity,
      lookingForGender: validData.lookingForGender,
      lookingForEthnicity: validData.lookingForEthnicity,
      photo: validData.photo
    };

    // Handle profile image upload
    if (validImage) {
      try {
        const blob = await put(
          `userimages/${Date.now()}-${session.user.email}-profile.jpg`, 
          validImage, 
          { access: 'public' }
        );
        
        profileUpdate.photo = blob.url;
        console.log(`profile image uploaded to vercel blob: ${blob.url}`);
      } catch (error) {
        console.error('error uploading profile image to vercel blob:', error);
        return NextResponse.json({ error: 'failed to upload profile image to storage' }, { status: 500 });
      }
    }

    // Structure the update object correctly
    const updateData: { [key: string]: any } = {
      profile: profileUpdate,
      updatedAt: new Date()
    };

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
  }
}