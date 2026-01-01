import { Resend } from 'resend';
import OtpChatEmail from '@/components/EmailTemplate';
import MatchingEmail from '@/components/MatchingEmail';
import NoMatchEmail from '@/components/NoMatchEmail';
import { sanitizeEmail } from '@/lib/auth-utils';

let resend: Resend | undefined;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

export const sendOTPEmail = async (email: string, otpCode: string, type: 'signup' | 'password-reset' = 'signup') => {
  if (!resend) {
    console.warn('Resend API key not set. Skipping email sending.');
    return { success: true, data: null };
  }

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
  userName: string,
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
  if (!resend) {
    console.warn('Resend API key not set. Skipping email sending.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'looksmatr <onboarding@resend.dev>',
      to: [email],
      subject: 'you have a new match! 💘',
      react: MatchingEmail({
        name: userName,
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

export const sendNoMatchEmail = async (email: string, userName: string = 'there') => {
  if (!resend) {
    console.warn('Resend API key not set. Skipping email sending.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'looksmatr <onboarding@resend.dev>',
      to: [email],
      subject: 'we got some bad news for you 😬',
      react: NoMatchEmail({ name: userName }),
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