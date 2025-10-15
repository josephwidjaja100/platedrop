import { ObjectId } from 'mongodb';

export interface OTP {
  _id: ObjectId;
  email: string;
  code: string;
  type: 'signup' | 'password-reset' | 'email-verification';
  attempts: number;
  maxAttempts: number;
  userData?: {
    password?: string; // This will be hashed
  };
  createdAt: Date;
  expiresAt: Date; // TTL index field
}