import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { sendMatchEmail, sendNoMatchEmail } from '@/lib/email-service';

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await client.connect();
    const db = client.db('platedrop');
    const usersCollection = db.collection('users');
    const matchesCollection = db.collection('matches');

    // Get all existing matches to prevent duplicates
    const existingMatches = await matchesCollection.find({}).toArray();
    const matchedPairs = new Set<string>();
    
    existingMatches.forEach(match => {
      const user1Id = match.user1Id.toString();
      const user2Id = match.user2Id.toString();
      // Create a sorted pair key to ensure consistency
      const pairKey = [user1Id, user2Id].sort().join('_');
      matchedPairs.add(pairKey);
    });

    // Get all users opted into matching
    const users = await usersCollection.find({
      'profile.optInMatching': true,
      'profile.name': { $ne: null, $exists: true },
      'profile.year': { $ne: null, $exists: true },
      'profile.major': { $ne: null, $exists: true },
      'profile.gender': { $ne: null, $exists: true },
      'profile.instagram': { $ne: null, $exists: true },
      'profile.photo': { $ne: null, $exists: true },
      'profile.attractiveness': { $gt: 0 }
    }).toArray();

    if (users.length < 2) {
      return NextResponse.json({ 
        message: 'Not enough users to match',
        count: users.length 
      });
    }

    const matches: Array<{ user1: any; user2: any; score: number }> = [];

    // Helper function to check if two users have already been matched
    const alreadyMatched = (user1Id: string, user2Id: string): boolean => {
      const pairKey = [user1Id, user2Id].sort().join('_');
      return matchedPairs.has(pairKey);
    };

    // Helper function to check if preferences match
    const preferencesMatch = (user1: any, user2: any): boolean => {
      const u1Profile = user1.profile;
      const u2Profile = user2.profile;

      // Check if these users have already been matched
      if (alreadyMatched(user1._id.toString(), user2._id.toString())) {
        return false;
      }

      // Check if user1 matches user2's gender preference
      const user1MatchesGenderPref = 
        !u2Profile.lookingForGender || 
        u2Profile.lookingForGender.length === 0 || 
        u2Profile.lookingForGender.includes(u1Profile.gender);

      // Check if user2 matches user1's gender preference
      const user2MatchesGenderPref = 
        !u1Profile.lookingForGender ||
        u1Profile.lookingForGender.length === 0 || 
        u1Profile.lookingForGender.includes(u2Profile.gender);

      // Check if user1 matches user2's ethnicity preference
      const user1MatchesEthnicityPref = 
        !u2Profile.lookingForEthnicity ||
        u2Profile.lookingForEthnicity.length === 0 ||
        u2Profile.lookingForEthnicity.includes('prefer not to answer') ||
        u1Profile.ethnicity.includes('prefer not to answer') ||
        u1Profile.ethnicity.some((eth: string) => 
          u2Profile.lookingForEthnicity.includes(eth)
        );

      // Check if user2 matches user1's ethnicity preference
      const user2MatchesEthnicityPref = 
        !u1Profile.lookingForEthnicity ||
        u1Profile.lookingForEthnicity.length === 0 ||
        u1Profile.lookingForEthnicity.includes('prefer not to answer') ||
        u2Profile.ethnicity.includes('prefer not to answer') ||
        u2Profile.ethnicity.some((eth: string) => 
          u1Profile.lookingForEthnicity.includes(eth)
        );

      return (
        user1MatchesGenderPref && 
        user2MatchesGenderPref && 
        user1MatchesEthnicityPref && 
        user2MatchesEthnicityPref
      );
    };

    // Stable Marriage Algorithm with Attractiveness Optimization
    const findOptimalMatching = (users: any[]): Array<{ user1: any; user2: any; score: number }> => {
      
      // Build adjacency list directly while checking preferences
      const preferences = new Map<string, Array<{ userId: string; diff: number; user: any }>>();
      const userMap = new Map(users.map(u => [u._id.toString(), u]));
      
      // Check all pairs and build adjacency list in one pass
      for (let i = 0; i < users.length; i++) {
        for (let j = i + 1; j < users.length; j++) {
          const user1 = users[i];
          const user2 = users[j];

          // Check if preferences match (this now includes checking if already matched)
          if (preferencesMatch(user1, user2)) {
            const id1 = user1._id.toString();
            const id2 = user2._id.toString();
            const diff = Math.abs(user1.profile.attractiveness - user2.profile.attractiveness);
            
            // Initialize preference arrays if needed
            if (!preferences.has(id1)) preferences.set(id1, []);
            if (!preferences.has(id2)) preferences.set(id2, []);
            
            // Add each user to the other's preference list
            preferences.get(id1)!.push({ userId: id2, diff, user: user2 });
            preferences.get(id2)!.push({ userId: id1, diff, user: user1 });
          }
        }
      }
      
      // Sort each user's preferences by attractiveness difference (ascending)
      for (const [userId, prefs] of preferences) {
        prefs.sort((a, b) => a.diff - b.diff);
      }
      
      // Gale-Shapley Stable Marriage Algorithm adapted for minimum difference
      const engaged = new Map<string, string>();
      const free = new Set(users.map(u => u._id.toString()));
      const proposalIndex = new Map<string, number>();
      
      users.forEach(u => proposalIndex.set(u._id.toString(), 0));
      
      while (free.size > 0) {
        const proposerId = Array.from(free)[0];
        const proposerPrefs = preferences.get(proposerId) || [];
        const currentIndex = proposalIndex.get(proposerId) || 0;
        
        if (currentIndex >= proposerPrefs.length) {
          free.delete(proposerId);
          continue;
        }
        
        const preferred = proposerPrefs[currentIndex];
        proposalIndex.set(proposerId, currentIndex + 1);
        
        const preferredId = preferred.userId;
        const currentPartner = engaged.get(preferredId);
        
        if (!currentPartner) {
          engaged.set(proposerId, preferredId);
          engaged.set(preferredId, proposerId);
          free.delete(proposerId);
        } else {
          const preferredPersonPrefs = preferences.get(preferredId) || [];
          const proposerRank = preferredPersonPrefs.findIndex(p => p.userId === proposerId);
          const currentRank = preferredPersonPrefs.findIndex(p => p.userId === currentPartner);
          
          if (proposerRank !== -1 && (currentRank === -1 || proposerRank < currentRank)) {
            engaged.delete(currentPartner);
            engaged.set(proposerId, preferredId);
            engaged.set(preferredId, proposerId);
            free.delete(proposerId);
            free.add(currentPartner);
          }
        }
      }
      
      // Convert engaged pairs to match objects
      const finalMatches: Array<{ user1: any; user2: any; score: number }> = [];
      const processed = new Set<string>();
      
      for (const [userId, partnerId] of engaged) {
        if (!processed.has(userId) && !processed.has(partnerId)) {
          const user1 = userMap.get(userId);
          const user2 = userMap.get(partnerId);
          
          if (user1 && user2) {
            const diff = Math.abs(user1.profile.attractiveness - user2.profile.attractiveness);
            const score = 100 - diff;
            finalMatches.push({ user1, user2, score });
            processed.add(userId);
            processed.add(partnerId);
          }
        }
      }
      
      // Local optimization pass
      let improved = true;
      let iterations = 0;
      const maxIterations = 10;
      
      while (improved && iterations < maxIterations) {
        improved = false;
        iterations++;
        
        for (let i = 0; i < finalMatches.length; i++) {
          for (let j = i + 1; j < finalMatches.length; j++) {
            const match1 = finalMatches[i];
            const match2 = finalMatches[j];
            
            const currentDiff = 
              Math.abs(match1.user1.profile.attractiveness - match1.user2.profile.attractiveness) +
              Math.abs(match2.user1.profile.attractiveness - match2.user2.profile.attractiveness);
            
            const canSwap1 = preferencesMatch(match1.user1, match2.user1) && 
                            preferencesMatch(match1.user2, match2.user2);
            if (canSwap1) {
              const newDiff1 = 
                Math.abs(match1.user1.profile.attractiveness - match2.user1.profile.attractiveness) +
                Math.abs(match1.user2.profile.attractiveness - match2.user2.profile.attractiveness);
              
              if (newDiff1 < currentDiff) {
                const temp = match1.user2;
                match1.user2 = match2.user1;
                match2.user1 = temp;
                match1.score = 100 - Math.abs(match1.user1.profile.attractiveness - match1.user2.profile.attractiveness);
                match2.score = 100 - Math.abs(match2.user1.profile.attractiveness - match2.user2.profile.attractiveness);
                improved = true;
              }
            }
            
            const canSwap2 = preferencesMatch(match1.user1, match2.user2) && 
                            preferencesMatch(match1.user2, match2.user1);
            if (canSwap2) {
              const newDiff2 = 
                Math.abs(match1.user1.profile.attractiveness - match2.user2.profile.attractiveness) +
                Math.abs(match1.user2.profile.attractiveness - match2.user1.profile.attractiveness);
              
              if (newDiff2 < currentDiff) {
                const temp = match1.user2;
                match1.user2 = match2.user2;
                match2.user2 = temp;
                match1.score = 100 - Math.abs(match1.user1.profile.attractiveness - match1.user2.profile.attractiveness);
                match2.score = 100 - Math.abs(match2.user1.profile.attractiveness - match2.user2.profile.attractiveness);
                improved = true;
              }
            }
          }
        }
      }
      
      return finalMatches;
    };

    // Use stable marriage algorithm with local optimization
    const optimalMatches = findOptimalMatching(users);
    matches.push(...optimalMatches);

    // Track which users got matched
    const matchedUserIds = new Set<string>();
    matches.forEach(match => {
      matchedUserIds.add(match.user1._id.toString());
      matchedUserIds.add(match.user2._id.toString());
    });

    // Find users who didn't get matched
    const unmatchedUsers = users.filter(user => !matchedUserIds.has(user._id.toString()));

    // Store matches in database and send emails
    const emailPromises = matches.map(async (match) => {
      const { user1, user2, score } = match;
      
      // Calculate attractiveness difference (on 100 scale)
      const attractivenessDiff = Math.abs(user1.profile.attractiveness - user2.profile.attractiveness);
      
      const profile1 = {
        name: user1.profile.name,
        year: user1.profile.year,
        major: user1.profile.major,
        ethnicity: user1.profile.ethnicity,
        gender: user1.profile.gender,
        instagram: user1.profile.instagram,
        photo: user1.profile.photo,
        attractivenessDiff: attractivenessDiff
      };
      const profile2 = {
        name: user2.profile.name,
        year: user2.profile.year,
        major: user2.profile.major,
        ethnicity: user2.profile.ethnicity,
        gender: user2.profile.gender,
        instagram: user2.profile.instagram,
        photo: user2.profile.photo,
        attractivenessDiff: attractivenessDiff
      };

      // Create match document
      const matchDocument = {
        user1Id: user1._id,
        user2Id: user2._id,
        score: score,
        attractivenessDiff: attractivenessDiff,
        createdAt: new Date(),
        user1Profile: profile1,
        user2Profile: profile2
      };

      // Insert match into database
      await matchesCollection.insertOne(matchDocument);

      // Send email to user1 about user2 (with attractiveness diff)
      const email1Promise = sendMatchEmail(
        user1.email,
        profile2
      );

      // Send email to user2 about user1 (with attractiveness diff)
      const email2Promise = sendMatchEmail(
        user2.email,
        profile1
      );

      return Promise.all([email1Promise, email2Promise]);
    });

    // Send no-match emails to unmatched users
    const noMatchEmailPromises = unmatchedUsers.map(async (user) => {
      return sendNoMatchEmail(user.email);
    });

    await Promise.all([...emailPromises, ...noMatchEmailPromises]);

    return NextResponse.json({
      success: true,
      matchesCreated: matches.length,
      totalUsers: users.length,
      emailsSent: matches.length * 2 + unmatchedUsers.length,
      unmatchedUsers: unmatchedUsers.length
    });

  } catch (error) {
    console.error('Matching cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}