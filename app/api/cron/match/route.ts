import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { sendMatchEmail, sendNoMatchEmail } from '@/lib/email-service';
import { MongoClient } from 'mongodb';
import blossom from 'edmonds-blossom';
import { Client } from "@gradio/client";

// Interface definitions
interface User {
  _id: any;
  email: string;
  profile: {
    name: string;
    year: string;
    major: string;
    ethnicity: string[];
    gender: string;
    instagram: string;
    photo: string;
    attractiveness: number;
    optInMatching: boolean;
    lookingForGender?: string[];
    lookingForEthnicity?: string[];
  };
  createdAt: Date;
}

interface Edge {
  user1Index: number;
  user2Index: number;
  weight: number;
  user1Id: string;
  user2Id: string;
  compatibility: boolean;
}

interface MatchResult {
  user1: User;
  user2: User;
  score: number;
  attractivenessDiff: number;
  matchType?: 'drought-priority' | 'blossom';
}

interface HistoricalMatch {
  user1Id: string;
  user2Id: string;
  createdAt: Date;
}

interface NoMatchRecord {
  userId: string;
  weekDate: Date;
  createdAt: Date;
}

async function analyzeUserAttractiveness(imageUrl: string): Promise<number> {
  try {
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
    const attractiveness = parseFloat((result.data as string[])[0]) || 0;
    
    console.log('Extracted attractiveness score:', attractiveness);
    return attractiveness;
  } catch (error) {
    console.error('Error analyzing attractiveness:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  let dbClient: MongoClient | null = null;
  let attemptId: any = null;
  
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    dbClient = client;
    await dbClient.connect();
    const db = dbClient.db('platedrop');
    const usersCollection = db.collection('users');
    const matchesCollection = db.collection('matches');
    const matchAttemptsCollection = db.collection('match_attempts');
    const noMatchesCollection = db.collection('no_matches');

    // Start a match attempt record
    const attemptResult = await matchAttemptsCollection.insertOne({
      startedAt: new Date(),
      status: 'processing',
      algorithmVersion: 'v3.1-drought-priority-auto-analysis',
      stats: {}
    });
    attemptId = attemptResult.insertedId;

    // Get all potentially eligible users (including those with attractiveness: 0)
    const users: User[] = await usersCollection.find({
      'profile.optInMatching': true,
      'profile.name': { $exists: true, $ne: null },
      'profile.gender': { $exists: true, $ne: null },
      'profile.instagram': { $exists: true, $ne: null },
      'profile.photo': { $exists: true, $ne: null }
    }, {
      projection: {
        email: 1,
        'profile.name': 1,
        'profile.year': 1,
        'profile.major': 1,
        'profile.ethnicity': 1,
        'profile.gender': 1,
        'profile.instagram': 1,
        'profile.photo': 1,
        'profile.attractiveness': 1,
        'profile.lookingForGender': 1,
        'profile.lookingForEthnicity': 1,
        'profile.optInMatching': 1,
        createdAt: 1
      },
    }).toArray() as unknown as User[];

    if (users.length < 2) {
      await matchAttemptsCollection.updateOne(
        { _id: attemptId },
        { 
          $set: { 
            completedAt: new Date(),
            status: 'completed',
            stats: { 
              totalUsers: users.length, 
              matchesCreated: 0, 
              reason: 'Not enough users' 
            }
          }
        }
      );
      return NextResponse.json({ 
        message: 'Not enough users to match',
        count: users.length 
      });
    }

    // Analyze users with attractiveness: 0
    const usersToAnalyze = users.filter(user => 
      user.profile.attractiveness === 0 && user.profile.photo
    );
    
    console.log(`Found ${usersToAnalyze.length} users needing attractiveness analysis`);
    
    const analysisResults: Array<{ userId: string; success: boolean; attractiveness?: number; error?: string }> = [];
    
    for (const user of usersToAnalyze) {
      try {
        console.log(`Analyzing attractiveness for user ${user._id.toString()}`);
        const attractiveness = await analyzeUserAttractiveness(user.profile.photo);
        
        // Update user in database
        await usersCollection.updateOne(
          { _id: user._id },
          { 
            $set: {
              'profile.attractiveness': attractiveness,
              updatedAt: new Date()
            }
          }
        );
        
        // Update in-memory user object
        user.profile.attractiveness = attractiveness;
        
        analysisResults.push({
          userId: user._id.toString(),
          success: true,
          attractiveness
        });
        
        console.log(`Successfully analyzed user ${user._id.toString()}: ${attractiveness}`);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to analyze user ${user._id.toString()}:`, error);
        analysisResults.push({
          userId: user._id.toString(),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Filter users who still have attractiveness > 0 after analysis attempts
    const eligibleUsers = users.filter(user => user.profile.attractiveness > 0);
    
    if (eligibleUsers.length < 2) {
      await matchAttemptsCollection.updateOne(
        { _id: attemptId },
        { 
          $set: { 
            completedAt: new Date(),
            status: 'completed',
            stats: { 
              totalUsers: users.length,
              usersAnalyzed: usersToAnalyze.length,
              analysisSuccesses: analysisResults.filter(r => r.success).length,
              analysisFailures: analysisResults.filter(r => !r.success).length,
              eligibleUsers: eligibleUsers.length,
              matchesCreated: 0, 
              reason: 'Not enough eligible users after analysis' 
            }
          }
        }
      );
      return NextResponse.json({ 
        message: 'Not enough eligible users to match after analysis',
        totalUsers: users.length,
        eligibleUsers: eligibleUsers.length,
        analysisResults
      });
    }

    // Calculate 5 weeks ago date
    const fiveWeeksAgo = new Date();
    fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35); // 5 weeks = 35 days

    // Step 1: Get drought users (users who had no match in past 5 weeks)
    const recentNoMatches: NoMatchRecord[] = await noMatchesCollection.find({
      weekDate: { $gte: fiveWeeksAgo }
    }).toArray() as unknown as NoMatchRecord[];

    // Group by user and find their earliest no-match week
    const droughtUserMap = new Map<string, Date>();
    recentNoMatches.forEach(record => {
      const userId = record.userId.toString();
      const existingDate = droughtUserMap.get(userId);
      if (!existingDate || record.weekDate < existingDate) {
        droughtUserMap.set(userId, record.weekDate);
      }
    });

    // Sort drought users by earliest no-match date (oldest first = highest priority)
    const droughtUsersPriority = Array.from(droughtUserMap.entries())
      .sort((a, b) => a[1].getTime() - b[1].getTime())
      .map(([userId]) => userId);

    console.log(`Found ${droughtUsersPriority.length} drought users to prioritize`);

    // Step 2: Get ALL historical matches to prevent any rematches
    const allHistoricalMatches: HistoricalMatch[] = await matchesCollection.find(
      {},
      { projection: { user1Id: 1, user2Id: 1, createdAt: 1 } }
    ).toArray() as unknown as HistoricalMatch[];

    // Create a map of historical matches for O(1) lookup
    const historicalMatchSet = new Set<string>();
    const historicalMatchesByUser = new Map<string, Set<string>>();
    
    allHistoricalMatches.forEach(match => {
      const user1Id = match.user1Id.toString();
      const user2Id = match.user2Id.toString();
      
      const pairKey1 = `${user1Id}_${user2Id}`;
      const pairKey2 = `${user2Id}_${user1Id}`;
      
      historicalMatchSet.add(pairKey1);
      historicalMatchSet.add(pairKey2);
      
      if (!historicalMatchesByUser.has(user1Id)) {
        historicalMatchesByUser.set(user1Id, new Set());
      }
      if (!historicalMatchesByUser.has(user2Id)) {
        historicalMatchesByUser.set(user2Id, new Set());
      }
      
      historicalMatchesByUser.get(user1Id)!.add(user2Id);
      historicalMatchesByUser.get(user2Id)!.add(user1Id);
    });

    // Create index mapping for eligible users only
    const userIndexMap = new Map<string, number>();
    const indexUserMap = new Map<number, User>();
    
    eligibleUsers.forEach((user, index) => {
      const userId = user._id.toString();
      userIndexMap.set(userId, index);
      indexUserMap.set(index, user);
    });

    // Step 3: Build compatibility graph with edges
    const edges: Edge[] = [];
    const maxWeight = 100;
    
    for (let i = 0; i < eligibleUsers.length; i++) {
      const user1 = eligibleUsers[i];
      const user1Id = user1._id.toString();
      
      for (let j = i + 1; j < eligibleUsers.length; j++) {
        const user2 = eligibleUsers[j];
        const user2Id = user2._id.toString();
        
        // Skip if already matched historically
        const historicalMatchesForUser1 = historicalMatchesByUser.get(user1Id);
        if (historicalMatchesForUser1?.has(user2Id)) {
          continue;
        }
        
        // Check if same year/grade level
        if (user1.profile.year !== user2.profile.year) {
          continue;
        }
        
        // Check gender preferences
        const user1Prefs = user1.profile.lookingForGender || [];
        const user2Prefs = user2.profile.lookingForGender || [];
        
        const user1Compatible = user1Prefs.length === 0 || user1Prefs.includes(user2.profile.gender);
        const user2Compatible = user2Prefs.length === 0 || user2Prefs.includes(user1.profile.gender);
        
        if (!user1Compatible || !user2Compatible) {
          continue;
        }
        
        // Check ethnicity preferences
        const user1EthPrefs = user1.profile.lookingForEthnicity || [];
        const user2EthPrefs = user2.profile.lookingForEthnicity || [];
        const user1Ethnicity = user1.profile.ethnicity || [];
        const user2Ethnicity = user2.profile.ethnicity || [];
        
        const user1EthCompatible = 
          user2EthPrefs.length === 0 ||
          user2EthPrefs.includes('prefer not to answer') ||
          user1Ethnicity.includes('prefer not to answer') ||
          user1Ethnicity.some(eth => user2EthPrefs.includes(eth));
        
        const user2EthCompatible = 
          user1EthPrefs.length === 0 ||
          user1EthPrefs.includes('prefer not to answer') ||
          user2Ethnicity.includes('prefer not to answer') ||
          user2Ethnicity.some(eth => user1EthPrefs.includes(eth));
        
        if (!user1EthCompatible || !user2EthCompatible) {
          continue;
        }
        
        // Calculate attractiveness difference
        const weight = Math.abs(user1.profile.attractiveness - user2.profile.attractiveness);
        
        edges.push({
          user1Index: i,
          user2Index: j,
          weight: Math.max(0.1, Math.min(weight, maxWeight)),
          user1Id,
          user2Id,
          compatibility: true
        });
      }
    }

    // Step 4: Process drought users first with greedy algorithm
    const matchedUserIds = new Set<string>();
    const successfulMatches: MatchResult[] = [];
    
    // Filter edges for drought users and sort by priority
    for (const droughtUserId of droughtUsersPriority) {
      if (matchedUserIds.has(droughtUserId)) {
        continue; // Already matched
      }
      
      const droughtUserIndex = userIndexMap.get(droughtUserId);
      if (droughtUserIndex === undefined) {
        continue; // User not in current pool
      }
      
      // Get all compatible edges for this drought user
      const droughtUserEdges = edges.filter(edge => 
        (edge.user1Index === droughtUserIndex && !matchedUserIds.has(edge.user2Id)) ||
        (edge.user2Index === droughtUserIndex && !matchedUserIds.has(edge.user1Id))
      );
      
      if (droughtUserEdges.length === 0) {
        console.log(`No compatible matches found for drought user ${droughtUserId}`);
        continue;
      }
      
      // Sort by weight (best match first) - greedy approach
      droughtUserEdges.sort((a, b) => a.weight - b.weight);
      
      // Take the best available match
      const bestEdge = droughtUserEdges[0];
      const user1 = indexUserMap.get(bestEdge.user1Index)!;
      const user2 = indexUserMap.get(bestEdge.user2Index)!;
      const user1Id = user1._id.toString();
      const user2Id = user2._id.toString();
      
      // Mark both users as matched
      matchedUserIds.add(user1Id);
      matchedUserIds.add(user2Id);
      
      const attractivenessDiff = Math.abs(
        user1.profile.attractiveness - user2.profile.attractiveness
      );
      const score = Math.max(0, 100 - attractivenessDiff);
      
      successfulMatches.push({
        user1,
        user2,
        score,
        attractivenessDiff,
        matchType: 'drought-priority'
      });
      
      console.log(`Matched drought user ${droughtUserId} with ${user1Id === droughtUserId ? user2Id : user1Id}`);
    }

    // Step 5: Run Blossom algorithm for remaining users
    const remainingEdges = edges.filter(edge => 
      !matchedUserIds.has(edge.user1Id) && !matchedUserIds.has(edge.user2Id)
    );
    
    if (remainingEdges.length > 0) {
      const blossomMatches = findOptimalMatchesWithBlossom(remainingEdges, eligibleUsers.length, maxWeight);
      
      for (const match of blossomMatches) {
        const user1 = indexUserMap.get(match.user1Index);
        const user2 = indexUserMap.get(match.user2Index);
        
        if (!user1 || !user2) continue;
        
        const user1Id = user1._id.toString();
        const user2Id = user2._id.toString();
        
        if (matchedUserIds.has(user1Id) || matchedUserIds.has(user2Id)) {
          continue;
        }
        
        matchedUserIds.add(user1Id);
        matchedUserIds.add(user2Id);
        
        const attractivenessDiff = Math.abs(
          user1.profile.attractiveness - user2.profile.attractiveness
        );
        const score = Math.max(0, 100 - attractivenessDiff);
        
        successfulMatches.push({
          user1,
          user2,
          score,
          attractivenessDiff,
          matchType: 'blossom'
        });
      }
    }
    
    // Step 6: Save matches to database
    const session = dbClient!.startSession();
    
    try {
      await session.withTransaction(async () => {
        for (const match of successfulMatches) {
          const { user1, user2, attractivenessDiff, score, matchType } = match;
          
          const user1Id = user1._id.toString();
          const user2Id = user2._id.toString();
          
          // Final sanity check
          if (historicalMatchesByUser.get(user1Id)?.has(user2Id) ||
              historicalMatchesByUser.get(user2Id)?.has(user1Id)) {
            console.warn(`Attempted to create duplicate match between ${user1Id} and ${user2Id}`);
            continue;
          }
          
          const profile1 = {
            name: user1.profile.name,
            year: user1.profile.year,
            major: user1.profile.major,
            ethnicity: user1.profile.ethnicity,
            gender: user1.profile.gender,
            instagram: user1.profile.instagram,
            photo: user1.profile.photo,
            attractivenessDiff,
            matchScore: score
          };
          
          const profile2 = {
            name: user2.profile.name,
            year: user2.profile.year,
            major: user2.profile.major,
            ethnicity: user2.profile.ethnicity,
            gender: user2.profile.gender,
            instagram: user2.profile.instagram,
            photo: user2.profile.photo,
            attractivenessDiff,
            matchScore: score
          };
          
          const matchDocument = {
            user1Id: user1._id,
            user2Id: user2._id,
            score,
            attractivenessDiff,
            algorithmVersion: 'v3.1-drought-priority-auto-analysis',
            matchType,
            matchAttemptId: attemptId,
            createdAt: new Date(),
            user1Profile: profile1,
            user2Profile: profile2,
            userIds: [user1Id, user2Id],
            userIdPairs: [`${user1Id}_${user2Id}`, `${user2Id}_${user1Id}`]
          };
          
          await matchesCollection.insertOne(matchDocument, { session });
          
          historicalMatchesByUser.get(user1Id)?.add(user2Id);
          historicalMatchesByUser.get(user2Id)?.add(user1Id);
        }
      });
    } finally {
      await session.endSession();
    }
    
    // Step 7: Record no-matches for this week
    const currentWeekDate = new Date();
    currentWeekDate.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const unmatchedUsers = eligibleUsers.filter(user => !matchedUserIds.has(user._id.toString()));
    
    if (unmatchedUsers.length > 0) {
      const noMatchRecords = unmatchedUsers.map(user => ({
        userId: user._id.toString(),
        weekDate: currentWeekDate,
        createdAt: new Date()
      }));
      
      await noMatchesCollection.insertMany(noMatchRecords);
    }
    
    // Step 8: Send emails
    type MatchEmailJob = {
      type: 'match';
      email: string;
      userName: string;
      matchProfile: any;
      userId: string;
    };

    type NoMatchEmailJob = {
      type: 'no-match';
      email: string;
      userName: string;
      userId: string;
    };

    type EmailJob = MatchEmailJob | NoMatchEmailJob;

    const emailQueue: EmailJob[] = [];
    const emailResults: Array<{ email: string; success: boolean; error?: string }> = [];
    
    // Queue match emails
    for (const match of successfulMatches) {
      const { user1, user2, attractivenessDiff, score } = match;
      
      const profile1 = {
        name: user1.profile.name,
        year: user1.profile.year,
        major: user1.profile.major,
        ethnicity: user1.profile.ethnicity,
        gender: user1.profile.gender,
        instagram: user1.profile.instagram,
        photo: user1.profile.photo,
        attractivenessDiff,
        matchScore: score
      };
      
      const profile2 = {
        name: user2.profile.name,
        year: user2.profile.year,
        major: user2.profile.major,
        ethnicity: user2.profile.ethnicity,
        gender: user2.profile.gender,
        instagram: user2.profile.instagram,
        photo: user2.profile.photo,
        attractivenessDiff,
        matchScore: score
      };
      
      emailQueue.push({
        type: 'match',
        email: user1.email,
        userName: user1.profile.name,
        matchProfile: profile2,
        userId: user1._id.toString()
      });
      
      emailQueue.push({
        type: 'match',
        email: user2.email,
        userName: user2.profile.name,
        matchProfile: profile1,
        userId: user2._id.toString()
      });
    }
    
    // Queue no-match emails
    for (const user of unmatchedUsers) {
      emailQueue.push({
        type: 'no-match',
        email: user.email,
        userName: user.profile.name,
        userId: user._id.toString()
      });
    }
    
    // Process email queue
    const EMAIL_DELAY_MS = 1000;
    const MAX_RETRIES = 2;
    
    for (const emailJob of emailQueue) {
      let retries = 0;
      let success = false;
      
      while (retries <= MAX_RETRIES && !success) {
        try {
          if (emailJob.type === 'match') {
            await sendMatchEmail(emailJob.email, emailJob.userName, emailJob.matchProfile);
          } else {
            await sendNoMatchEmail(emailJob.email, emailJob.userName);
          }
          success = true;
          emailResults.push({ email: emailJob.email, success: true });
        } catch (error) {
          retries++;
          if (retries > MAX_RETRIES) {
            console.error(`Failed to send email to ${emailJob.email} after ${MAX_RETRIES} retries:`, error);
            emailResults.push({ 
              email: emailJob.email, 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
          } else {
            console.warn(`Retry ${retries} for email to ${emailJob.email}`);
            await new Promise(resolve => setTimeout(resolve, 2000 * retries));
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, EMAIL_DELAY_MS));
    }
    
    // Step 9: Update attempt record
    const droughtMatchCount = successfulMatches.filter(m => m.matchType === 'drought-priority').length;
    const blossomMatchCount = successfulMatches.filter(m => m.matchType === 'blossom').length;
    
    const stats = {
      totalUsers: users.length,
      usersAnalyzed: usersToAnalyze.length,
      analysisSuccesses: analysisResults.filter(r => r.success).length,
      analysisFailures: analysisResults.filter(r => !r.success).length,
      eligibleUsers: eligibleUsers.length,
      matchedUsers: matchedUserIds.size,
      matchesCreated: successfulMatches.length,
      droughtUsersFound: droughtUsersPriority.length,
      droughtMatches: droughtMatchCount,
      blossomMatches: blossomMatchCount,
      unmatchedUsers: unmatchedUsers.length,
      totalEdges: edges.length,
      matchRate: eligibleUsers.length > 0 ? (matchedUserIds.size / eligibleUsers.length) * 100 : 0
    };
    
    if (successfulMatches.length > 0) {
      const totalAttractivenessDiff = successfulMatches.reduce((sum, m) => sum + m.attractivenessDiff, 0);
      const totalScore = successfulMatches.reduce((sum, m) => sum + m.score, 0);
      
      Object.assign(stats, {
        avgAttractivenessDiff: parseFloat((totalAttractivenessDiff / successfulMatches.length).toFixed(2)),
        avgMatchScore: parseFloat((totalScore / successfulMatches.length).toFixed(2)),
        minAttractivenessDiff: Math.min(...successfulMatches.map(m => m.attractivenessDiff)),
        maxAttractivenessDiff: Math.max(...successfulMatches.map(m => m.attractivenessDiff))
      });
    }
    
    Object.assign(stats, {
      emailSuccesses: emailResults.filter(r => r.success).length,
      emailFailures: emailResults.filter(r => !r.success).length,
      emailSuccessRate: emailResults.length > 0 
        ? parseFloat(((emailResults.filter(r => r.success).length / emailResults.length) * 100).toFixed(2))
        : 0
    });
    
    await matchAttemptsCollection.updateOne(
      { _id: attemptId },
      { 
        $set: { 
          completedAt: new Date(),
          status: 'completed',
          stats,
          analysisResults
        }
      }
    );
    
    return NextResponse.json({
      success: true,
      attemptId: attemptId.toString(),
      stats,
      analysisResults,
      algorithm: 'drought-priority-with-blossom-auto-analysis',
      droughtUsersPrioritized: droughtUsersPriority.length,
      guarantee: 'Drought users (no match in past 5 weeks) are matched first with greedy algorithm. Users with attractiveness=0 are automatically analyzed.'
    });
    
  } catch (error) {
    console.error('Matching cron job error:', error);
    
    if (dbClient && attemptId) {
      try {
        const db = dbClient.db('platedrop');
        const matchAttemptsCollection = db.collection('match_attempts');
        await matchAttemptsCollection.updateOne(
          { _id: attemptId },
          { 
            $set: { 
              completedAt: new Date(),
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
              errorStack: error instanceof Error ? error.stack : undefined
            }
          }
        );
      } catch (updateError) {
        console.error('Failed to update attempt record:', updateError);
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        attemptId: attemptId?.toString()
      },
      { status: 500 }
    );
  } finally {
    if (dbClient) {
      await dbClient.close();
    }
  }
}

function findOptimalMatchesWithBlossom(
  edges: Edge[], 
  userCount: number, 
  maxWeight: number
): Array<{user1Index: number; user2Index: number; weight: number}> {
  
  if (edges.length === 0) return [];
  
  const blossomEdges: [number, number, number][] = edges.map(edge => [
    edge.user1Index,
    edge.user2Index,
    edge.weight
  ]);
  
  try {
    const result = blossom(blossomEdges, true);
    
    const matches: Array<{user1Index: number; user2Index: number; weight: number}> = [];
    const processed = new Set<number>();
    
    for (let i = 0; i < result.length; i++) {
      const partner = result[i];
      
      if (partner !== -1 && !processed.has(i) && !processed.has(partner)) {
        const edge = edges.find(e => 
          (e.user1Index === i && e.user2Index === partner) ||
          (e.user1Index === partner && e.user2Index === i)
        );
        
        if (edge) {
          matches.push({
            user1Index: i,
            user2Index: partner,
            weight: edge.weight
          });
          
          processed.add(i);
          processed.add(partner);
        }
      }
    }
    
    return matches;
  } catch (error) {
    console.error('Blossom algorithm error:', error);
    console.log('Falling back to greedy matching');
    return findGreedyMatches(edges);
  }
}

function findGreedyMatches(edges: Edge[]): Array<{user1Index: number; user2Index: number; weight: number}> {
  const matches: Array<{user1Index: number; user2Index: number; weight: number}> = [];
  const matched = new Set<number>();
  
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  
  for (const edge of sortedEdges) {
    if (!matched.has(edge.user1Index) && !matched.has(edge.user2Index)) {
      matches.push({
        user1Index: edge.user1Index,
        user2Index: edge.user2Index,
        weight: edge.weight
      });
      
      matched.add(edge.user1Index);
      matched.add(edge.user2Index);
    }
  }
  
  return matches;
}