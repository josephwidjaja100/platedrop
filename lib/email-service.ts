import { Resend } from 'resend';
import OtpChatEmail from '@/components/EmailTemplate';
import MatchingEmail from '@/components/MatchingEmail';
import NoMatchEmail from '@/components/NoMatchEmail';
import { sanitizeEmail } from '@/lib/auth-utils';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (email: string, otpCode: string, type: 'signup' | 'password-reset' = 'signup') => {
  const subject = type === 'signup' ? 'complete your looksmatr account setup' : 'reset your password';
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'looksmatr <onboarding@resend.dev>',
      to: [email],
      subject,
      react: OtpChatEmail({
        email: sanitizeEmail(email),
        otpCode,
      }),
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Failed to send email' };
  }
};

export const sendMatchEmail = async (
  email: string, 
  matchData: {
    name: string;
    year: string;
    major: string;
    ethnicity: string[];
    gender: string;
    instagram: string;
    photo: string;
    attractivenessDiff: number;
  }
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'looksmatr <matches@looksmatr.com>',
      to: [email],
      subject: 'you have a new match! 💘',
      react: MatchingEmail({
        matchName: matchData.name,
        matchYear: matchData.year,
        matchMajor: matchData.major,
        matchEthnicity: matchData.ethnicity,
        matchGender: matchData.gender,
        matchInstagram: matchData.instagram,
        matchPhoto: matchData.photo,
        attractivenessDiff: matchData.attractivenessDiff,
      }),
    });

    if (error) {
      console.error('Error sending match email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending match email:', error);
    return { success: false, error: 'Failed to send match email' };
  }
};

export const sendNoMatchEmail = async (email: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'looksmatr <matches@looksmatr.com>',
      to: [email],
      subject: 'we got some bad news for you 😬',
      react: NoMatchEmail(),
    });

    if (error) {
      console.error('Error sending no match email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending no match email:', error);
    return { success: false, error: 'Failed to send no match email' };
  }
};