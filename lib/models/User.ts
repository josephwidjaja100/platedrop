import { ObjectId } from 'mongodb';

export interface EmailPassword {
  hashedPassword: string;
  emailVerified: boolean;
  verifiedAt?: Date;
  passwordUpdatedAt: Date;
}

export interface User {
  _id: ObjectId;
  profile: {
    name: string;
  }
  email?: string;
  createdAt: Date;
  updatedAt: Date;
  emailPassword?: EmailPassword;
  accounts?: any[];
}

// User creation options interface
export interface CreateUserOptions {
  email: string;
  name?: string;
  image?: string;
  hashedPassword?: string;
  emailVerified?: boolean;
  provider?: 'google' | 'credentials';
}