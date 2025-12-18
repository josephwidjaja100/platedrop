import { ObjectId } from 'mongodb';
import client from '@/lib/db';
import { User, CreateUserOptions, EmailPassword } from '@/lib/models/User';
import { sanitizeEmail } from '@/lib/auth-utils';

export const createUser = async (options: CreateUserOptions): Promise<User> => {
    const {
        email,
        name = '',
        hashedPassword,
        emailVerified = false,
        provider = 'credentials'
    } = options;

    // Sanitize email input
    const sanitizedEmail = sanitizeEmail(email);

    // Create EmailPassword object if password is provided
    let emailPasswordData: EmailPassword | undefined;
    if (hashedPassword) {
        emailPasswordData = {
            hashedPassword,
            emailVerified,
            verifiedAt: emailVerified ? new Date() : undefined,
            passwordUpdatedAt: new Date(),
        };
    }

    const newUser: User = {
        _id: new ObjectId(),
        profile: {
          name: name,
          year: '',
          major: '',
          instagram: '',
          photo: null,
          gender: '', 
          ethnicity: [], 
          lookingForGender: [],
          lookingForEthnicity: []
        },
        email: sanitizedEmail,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailPassword: emailPasswordData,
    };

    return newUser;
};

export const createOrUpdateUser = async (options: CreateUserOptions): Promise<{ user: User; isNew: boolean }> => {    
    await client.connect();
    const db = client.db('platedrop');
    const usersCollection = db.collection('users');

    const sanitizedEmail = sanitizeEmail(options.email);

    // Check if user exists
    const existingUser = await usersCollection.findOne({ email: sanitizedEmail });

    if (existingUser) {
        // Update existing user if needed
        const updateData: Partial<User> = {
            updatedAt: new Date(),
        };

        // If this is a Google signup and user doesn't have Google data
        if (options.provider === 'google') {
            // Update name from Google if not already set
            if (options.name && !existingUser.profile?.name) {
                updateData.profile = {
                    ...existingUser.profile,
                    name: options.name
                };
            }
        }

        // If this is email/password signup and user doesn't have emailPassword
        if (options.hashedPassword && !existingUser.emailPassword) {
            updateData.emailPassword = {
                hashedPassword: options.hashedPassword,
                emailVerified: options.emailVerified || false,
                verifiedAt: options.emailVerified ? new Date() : undefined,
                passwordUpdatedAt: new Date(),
            };
        }

        if (Object.keys(updateData).length > 1) { // More than just updatedAt
            await usersCollection.updateOne(
                { email: sanitizedEmail },
                { $set: updateData }
            );
        }

        return { user: existingUser as User, isNew: false };
    }

    // Create new user
    const newUser = await createUser(options);
    await usersCollection.insertOne(newUser);

    return { user: newUser, isNew: true };
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
    await client.connect();
    const db = client.db('platedrop');
    const usersCollection = db.collection('users');

    const sanitizedEmail = sanitizeEmail(email);
    const user = await usersCollection.findOne({ email: sanitizedEmail });

    return user as User | null;
};