import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import client from '@/lib/db';
import { Client } from "@gradio/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Get the image URL from request
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'image url is required' }, { status: 400 });
    }
    
    // Fetch user's preference array from database
    await client.connect();
    const db = client.db('platedrop');
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ email: session.user.email });
    const adjectivePreferences = user?.profile?.adjectivePreferences || [];
    
    console.log('User preferences for analysis:', adjectivePreferences);
    
    // Handle image URL (base64 data URLs or regular URLs)
    let imageBlob: Blob;
    
    if (imageUrl.startsWith('data:')) {
      // Base64 data URL - convert directly to blob
      const base64Data = imageUrl.split(',')[1];
      const mimeType = imageUrl.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
      const buffer = Buffer.from(base64Data, 'base64');
      imageBlob = new Blob([buffer], { type: mimeType });
    } else {
      // Regular URL - fetch it
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('failed to fetch image from url');
      }
      imageBlob = await imageResponse.blob();
    }
    
    const model = await Client.connect("jwidhaha/looksmatr");
    const result = await model.predict(
      "/analyze", {
        image: imageBlob,
        identifier: "person",
        preferences: adjectivePreferences, // Send the preference array to the AI
    });
    
    // Extract attractiveness score from the result
    const attractiveness = parseFloat((result.data as string[])[0]) || 0;
    console.log('Extracted attractiveness score:', attractiveness);
    console.log('Preferences sent to AI:', adjectivePreferences);

    // Update user profile (client already connected above)

    // Update user with composite attractiveness score
    const updateResult = await usersCollection.updateOne(
      { email: session.user.email },
      { 
        $set: {
          'profile.attractiveness': attractiveness,
          updatedAt: new Date()
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'attractiveness analysis completed',
      data: {
        attractiveness
      }
    });

  } catch (error) {
    console.error('error analyzing attractiveness:', error);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}