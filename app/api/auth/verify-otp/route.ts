import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { isValidEmail, sanitizeEmail } from '@/lib/auth-utils';
import { createOrUpdateUser } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, type } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { success: false, message: 'Valid 6-digit code is required' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeEmail(email);

    await client.connect();
    const db = client.db('platedrop');
    const otpCollection = db.collection('otps');

    // Find OTP document
    const otpDoc = await otpCollection.findOne({
      email: sanitizedEmail,
      type,
      expiresAt: { $gt: new Date() }
    });

    console.log("OTP document found:", !!otpDoc);

    if (!otpDoc) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Check attempts
    if (otpDoc.attempts >= otpDoc.maxAttempts) {
      await otpCollection.deleteOne({ _id: otpDoc._id });
      return NextResponse.json(
        { success: false, message: 'Too many failed attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    // Verify OTP
    if (otpDoc.code !== otp) {
      await otpCollection.updateOne(
        { _id: otpDoc._id },
        { $inc: { attempts: 1 } }
      );
      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    if (type === 'signup') {
      // Use consolidated user creation service
      const { user, isNew } = await createOrUpdateUser({
        email: sanitizedEmail,
        hashedPassword: otpDoc.userData?.password,
        emailVerified: true,
        provider: 'credentials'
      });

      // Clean up OTP
      await otpCollection.deleteOne({ _id: otpDoc._id });

      console.log(`Account ${isNew ? 'created' : 'updated'} successfully`);

      return NextResponse.json({
        success: true,
        message: 'Account created successfully',
        shouldSignIn: true,
      });

    } else if (type === 'password-reset') {
      return NextResponse.json({
        success: true,
        message: 'Code verified successfully',
        resetToken: otpDoc._id.toString(),
      });
    }

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}