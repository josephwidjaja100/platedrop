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
    
    // Fetch the image and convert to blob
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('failed to fetch image from url');
    }
    
    const imageBlob = await imageResponse.blob();
    
    const model = await Client.connect("jwidhaha/looksmatr");
    const result = await model.predict(
      "/analyze", {
        image: imageBlob,
        identifier: "person",
    });
    
    // Extract attractiveness score from the result
    // The result should be in beautyResult.data array
    const attractiveness = parseFloat((result.data as string[])[0]) || 0;
    
    console.log('Extracted attractiveness score:', attractiveness);

    // Connect to MongoDB and update user profile
    await client.connect();
    const db = client.db('platedrop');
    const usersCollection = db.collection('users');

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