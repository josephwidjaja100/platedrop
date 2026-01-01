import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { OTP } from '@/lib/models/OTP';
import { generateOTP, isValidEmail, hashPassword, sanitizeEmail, isValidPassword } from '@/lib/auth-utils';
import { sendOTPEmail } from '@/lib/email-service';
import { ObjectId } from 'mongodb';
import { getUserByEmail } from '@/lib/services/user-services';

export async function POST(request: NextRequest) {
  try {
    const { email, type, password } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'valid email is required' },
        { status: 400 }
      );
    }

    if (type === 'signup') {
      if (!password || !isValidPassword(password)) {
        return NextResponse.json(
          { success: false, message: 'password must be at least 8 characters long and contain at least one letter and one number' },
          { status: 400 }
        );
      }
    }

    const sanitizedEmail = sanitizeEmail(email);

    await client.connect();
    const db = client.db('platedrop');
    const otpCollection = db.collection('otps');

    // Check if user already exists
    const existingUser = await getUserByEmail(sanitizedEmail);

    if (type === 'signup') {
      if (existingUser) {
        // Check if user has Google account
        const hasGoogleAccount = existingUser.email && existingUser.emailPassword == null;
        if (hasGoogleAccount) {
          return NextResponse.json(
            {
              success: false,
              message: 'this email is already registered with Google. please sign in with Google instead.',
              hasGoogleAccount: true
            }, 
            { status: 409 }
          );
        }

        // Check if user already has email/password setup
        if (existingUser.emailPassword?.emailVerified) {
          return NextResponse.json(
            { success: false, message: 'an account with this email already exists. please sign in instead.' },
            { status: 409 }
          );
        }
      }
    } else if (type === 'password-reset') {
      if (!existingUser || !existingUser.emailPassword) {
        return NextResponse.json(
          { success: false, message: 'no account found with this email address.' },
          { status: 404 }
        );
      }
    }

    // Check for existing OTP
    const existingOTP = await otpCollection.findOne({ email: sanitizedEmail, type });

    if (existingOTP) {
      // Check if max attempts reached
      if (existingOTP.attempts >= 15) {
        return NextResponse.json(
          { success: false, message: 'maximum OTP requests reached. please wait for the current OTP to expire before requesting a new one.' },
          { status: 429 }
        );
      }

      // Check if 30 seconds have passed since last request
      const timeSinceLastRequest = Date.now() - existingOTP.createdAt.getTime();
      if (timeSinceLastRequest < 30 * 1000) {
        const remainingTime = Math.ceil((30 * 1000 - timeSinceLastRequest) / 1000);
        return NextResponse.json(
          { success: false, message: `please wait ${remainingTime} seconds before requesting another OTP.` },
          { status: 429 }
        );
      }

      // Increment attempts
      // await ..updateOne(
      //   { _id: existingOTP._id },
      //   { $inc: { attempts: 1 } }
      // );
    }

    // Generate OTP

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash password if it's a signup
    let hashedPassword;
    if (type === 'signup' && password) {
      hashedPassword = await hashPassword(password);
    }

    // Delete any existing OTP for this email and type
    await otpCollection.deleteMany({ email: sanitizedEmail, type });

    // Create new OTP document
    const otpDoc: OTP = {
      _id: new ObjectId(),
      email: sanitizedEmail,
      code: otpCode,
      type,
      attempts: 0,
      maxAttempts: 3,
      userData: type === 'signup' ? {
        password: hashedPassword,
      } : undefined,
      createdAt: new Date(),
      expiresAt,
    };

    // Insert OTP
    await otpCollection.insertOne(otpDoc);

    // Send email
    const emailResult = await sendOTPEmail(sanitizedEmail, otpCode, type);

    if (!emailResult.success) {
      // Clean up OTP document if email failed
      await otpCollection.deleteOne({ _id: otpDoc._id });
      return NextResponse.json(
        { success: false, message: 'failed to send verification email. please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `verification code sent to ${sanitizedEmail}`,
    });

  } catch (error) {
    console.error('error sending OTP:', error);
    return NextResponse.json(
      { success: false, message: 'service temporarily unavailable. please try again later.' },
      { status: 500 }
    );
  } finally {
    try {
      await client.close();
    } catch (closeError) {
      // Ignore close errors
    }
  }
}