import { Resend } from 'resend';
import OtpChatEmail from '@/components/EmailTemplate';
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
