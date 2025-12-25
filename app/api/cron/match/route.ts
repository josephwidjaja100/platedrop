import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { sendMatchEmail, sendNoMatchEmail } from '@/lib/email-service';
import { MongoClient } from 'mongodb';
import blossom from 'edmonds-blossom';

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
  weight: number; // Lower weight = better match
  user1Id: string;
  user2Id: string;
  compatibility: boolean;
}

interface MatchResult {
  user1: User;
  user2: User;
  score: number;
  attractivenessDiff: number;
}

interface HistoricalMatch {
  user1Id: string;
  user2Id: string;
  createdAt: Date;
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

    // Start a match attempt record
    const attemptResult = await matchAttemptsCollection.insertOne({
      startedAt: new Date(),
      status: 'processing',
      algorithmVersion: 'v2.0-blossom',
      stats: {}
    });
    attemptId = attemptResult.insertedId;

    // Get all eligible users
    const users: User[] = await usersCollection.find({
      'profile.optInMatching': true,
      'profile.name': { $exists: true, $ne: null },
      'profile.attractiveness': { $gt: 0, $exists: true },
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
      sort: { createdAt: 1 } // Prioritize older users waiting longer
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

    // Step 1: Get ALL historical matches to prevent any rematches
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
      
      // Store pair in both directions for easy lookup
      const pairKey1 = `${user1Id}_${user2Id}`;
      const pairKey2 = `${user2Id}_${user1Id}`;
      
      historicalMatchSet.add(pairKey1);
      historicalMatchSet.add(pairKey2);
      
      // Store by individual user for faster compatibility checking
      if (!historicalMatchesByUser.has(user1Id)) {
        historicalMatchesByUser.set(user1Id, new Set());
      }
      if (!historicalMatchesByUser.has(user2Id)) {
        historicalMatchesByUser.set(user2Id, new Set());
      }
      
      historicalMatchesByUser.get(user1Id)!.add(user2Id);
      historicalMatchesByUser.get(user2Id)!.add(user1Id);
    });

    // Create index mapping for users
    const userIndexMap = new Map<string, number>();
    const indexUserMap = new Map<number, User>();
    
    users.forEach((user, index) => {
      const userId = user._id.toString();
      userIndexMap.set(userId, index);
      indexUserMap.set(index, user);
    });

    // Step 2: Build compatibility graph with edges
    const edges: Edge[] = [];
    const maxWeight = 100; // Maximum attractiveness difference for normalization
    
    // Pre-compute gender compatibility matrix for efficiency
    const genderCompatibleMatrix: boolean[][] = Array(users.length)
      .fill(null)
      .map(() => Array(users.length).fill(false));
    
    // Pre-compute ethnicity compatibility matrix
    const ethnicityCompatibleMatrix: boolean[][] = Array(users.length)
      .fill(null)
      .map(() => Array(users.length).fill(false));
    
    // First pass: compute gender compatibility
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const user1 = users[i];
        const user2 = users[j];
        
        // Check gender preferences
        const user1Prefs = user1.profile.lookingForGender || [];
        const user2Prefs = user2.profile.lookingForGender || [];
        
        const user1Compatible = user1Prefs.length === 0 || user1Prefs.includes(user2.profile.gender);
        const user2Compatible = user2Prefs.length === 0 || user2Prefs.includes(user1.profile.gender);
        
        genderCompatibleMatrix[i][j] = user1Compatible && user2Compatible;
        genderCompatibleMatrix[j][i] = user1Compatible && user2Compatible;
      }
    }
    
    // Second pass: compute ethnicity compatibility and build edges
    for (let i = 0; i < users.length; i++) {
      const user1 = users[i];
      const user1Id = user1._id.toString();
      
      for (let j = i + 1; j < users.length; j++) {
        const user2 = users[j];
        const user2Id = user2._id.toString();
        
        // Skip if already matched historically (primary check)
        const historicalMatchesForUser1 = historicalMatchesByUser.get(user1Id);
        if (historicalMatchesForUser1?.has(user2Id)) {
          continue;
        }
        
        // Check gender compatibility (from precomputed matrix)
        if (!genderCompatibleMatrix[i][j]) {
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
        
        ethnicityCompatibleMatrix[i][j] = user1EthCompatible && user2EthCompatible;
        ethnicityCompatibleMatrix[j][i] = user1EthCompatible && user2EthCompatible;
        
        if (!ethnicityCompatibleMatrix[i][j]) {
          continue;
        }
        
        // Calculate attractiveness difference
        const attractivenessDiff = Math.abs(user1.profile.attractiveness - user2.profile.attractiveness);
        
        // Calculate weight: lower is better
        // We use a combination of attractiveness difference and waiting time
        const waitingTime1 = Date.now() - new Date(user1.createdAt).getTime();
        const waitingTime2 = Date.now() - new Date(user2.createdAt).getTime();
        const maxWaitingTime = 365 * 24 * 60 * 60 * 1000; // 1 year in ms
        
        // Normalize waiting time factor (0 to 0.3 weight adjustment)
        const waitingFactor = 0.3 * ((waitingTime1 + waitingTime2) / (2 * maxWaitingTime));
        
        // Final weight: attractiveness diff adjusted by waiting time
        // Users who waited longer get slightly better matches
        const weight = attractivenessDiff * (1 - Math.min(waitingFactor, 0.3));
        
        edges.push({
          user1Index: i,
          user2Index: j,
          weight: Math.max(0.1, Math.min(weight, maxWeight)), // Clamp weight
          user1Id,
          user2Id,
          compatibility: true
        });
      }
    }

    // Step 3: Run Edmonds' Blossom algorithm for optimal matching
    const matches = findOptimalMatchesWithBlossom(edges, users.length, maxWeight);
    
    // Step 4: Process matches with transaction
    const matchedUserIds = new Set<string>();
    const successfulMatches: MatchResult[] = [];
    
    const session = dbClient!.startSession();
    
    try {
      await session.withTransaction(async () => {
        for (const match of matches) {
          const user1 = indexUserMap.get(match.user1Index);
          const user2 = indexUserMap.get(match.user2Index);
          
          if (!user1 || !user2) {
            console.warn(`Invalid user index in match: ${match.user1Index}, ${match.user2Index}`);
            continue;
          }
          
          const user1Id = user1._id.toString();
          const user2Id = user2._id.toString();
          
          // Final sanity check: ensure no historical match
          if (historicalMatchesByUser.get(user1Id)?.has(user2Id) ||
              historicalMatchesByUser.get(user2Id)?.has(user1Id)) {
            console.warn(`Attempted to create duplicate match between ${user1Id} and ${user2Id}`);
            continue;
          }
          
          // Calculate metrics
          const attractivenessDiff = Math.abs(
            user1.profile.attractiveness - user2.profile.attractiveness
          );
          const score = Math.max(0, 100 - attractivenessDiff);
          
          // Prepare profiles
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
          
          // Create match document
          const matchDocument = {
            user1Id: user1._id,
            user2Id: user2._id,
            score,
            attractivenessDiff,
            algorithmVersion: 'v2.0-blossom',
            matchAttemptId: attemptId,
            createdAt: new Date(),
            user1Profile: profile1,
            user2Profile: profile2,
            // Store both ID formats for easy querying
            userIds: [user1Id, user2Id],
            userIdPairs: [`${user1Id}_${user2Id}`, `${user2Id}_${user1Id}`]
          };
          
          // Insert match
          await matchesCollection.insertOne(matchDocument, { session });
          
          // Update historical match tracking for this session
          historicalMatchesByUser.get(user1Id)?.add(user2Id);
          historicalMatchesByUser.get(user2Id)?.add(user1Id);
          
          // Track matched users
          matchedUserIds.add(user1Id);
          matchedUserIds.add(user2Id);
          
          successfulMatches.push({
            user1,
            user2,
            score,
            attractivenessDiff
          });
        }
      });
    } finally {
      await session.endSession();
    }
    
    // Step 5: Send emails with robust error handling and rate limiting
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
      const { user1, user2, attractivenessDiff } = match;
      
      const profile1 = {
        name: user1.profile.name,
        year: user1.profile.year,
        major: user1.profile.major,
        ethnicity: user1.profile.ethnicity,
        gender: user1.profile.gender,
        instagram: user1.profile.instagram,
        photo: user1.profile.photo,
        attractivenessDiff,
        matchScore: match.score
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
        matchScore: match.score
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
    
    // Queue no-match emails for unmatched users
    const unmatchedUsers = users.filter(user => !matchedUserIds.has(user._id.toString()));
    
    for (const user of unmatchedUsers) {
      emailQueue.push({
        type: 'no-match',
        email: user.email,
        userName: user.profile.name,
        userId: user._id.toString()
      });
    }
    
    // Process email queue with rate limiting and retries
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
            await new Promise(resolve => setTimeout(resolve, 2000 * retries)); // Exponential backoff
          }
        }
      }
      
      // Rate limiting between emails
      await new Promise(resolve => setTimeout(resolve, EMAIL_DELAY_MS));
    }
    
    // Step 6: Update attempt record with comprehensive stats
    const stats = {
      totalUsers: users.length,
      matchedUsers: matchedUserIds.size,
      matchesCreated: successfulMatches.length,
      unmatchedUsers: unmatchedUsers.length,
      totalEdges: edges.length,
      matchRate: users.length > 0 ? (matchedUserIds.size / users.length) * 100 : 0
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
          algorithmStats: {
            edgesConsidered: edges.length,
            usersWithNoCompatibleEdges: users.length - Array.from(new Set(edges.flatMap(e => [e.user1Index, e.user2Index]))).length
          }
        }
      }
    );
    
    return NextResponse.json({
      success: true,
      attemptId: attemptId.toString(),
      stats,
      algorithm: 'edmonds-blossom',
      historicalMatchesChecked: allHistoricalMatches.length,
      guarantee: 'No user will ever be matched with someone they were previously matched with'
    });
    
  } catch (error) {
    console.error('Matching cron job error:', error);
    
    // Update attempt record with error
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

/**
 * Find optimal matches using Edmonds' Blossom algorithm
 * This ensures maximum matching with minimum total weight
 */
function findOptimalMatchesWithBlossom(
  edges: Edge[], 
  userCount: number, 
  maxWeight: number
): Array<{user1Index: number; user2Index: number; weight: number}> {
  
  if (edges.length === 0) return [];
  
  // Prepare data for blossom algorithm
  // Blossom expects [i, j, weight] where weight is a cost (lower is better)
  const blossomEdges: [number, number, number][] = edges.map(edge => [
    edge.user1Index,
    edge.user2Index,
    edge.weight
  ]);
  
  try {
    // Run blossom algorithm for maximum matching with minimum weight
    const result = blossom(blossomEdges, true); // true = max cardinality
    
    // Process result into matches
    const matches: Array<{user1Index: number; user2Index: number; weight: number}> = [];
    const processed = new Set<number>();
    
    for (let i = 0; i < result.length; i++) {
      const partner = result[i];
      
      // blossom returns -1 for unmatched vertices, otherwise partner index
      if (partner !== -1 && !processed.has(i) && !processed.has(partner)) {
        // Find the original edge to get weight
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
    
    // Fallback to greedy matching if blossom fails
    console.log('Falling back to greedy matching');
    return findGreedyMatches(edges);
  }
}

/**
 * Fallback greedy matching algorithm
 */
function findGreedyMatches(edges: Edge[]): Array<{user1Index: number; user2Index: number; weight: number}> {
  const matches: Array<{user1Index: number; user2Index: number; weight: number}> = [];
  const matched = new Set<number>();
  
  // Sort edges by weight (best matches first)
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