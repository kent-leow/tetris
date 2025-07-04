// src/app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb, isDbConnected } from '../../../lib/db/mongo';

/**
 * CORS configuration for API routes
 * Supports multiple origins including www domains
 */
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'https://localhost:3000'
];

/**
 * Sets CORS headers for API responses
 */
function setCorsHeaders(response: NextResponse, origin?: string): NextResponse {
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  const response = new NextResponse(null, { status: 200 });
  return setCorsHeaders(response, origin || undefined);
}

/**
 * GET /api/leaderboard - Retrieve top scores
 * Returns ranked leaderboard with proper error handling
 */
export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  
  try {
    // Check database connection
    if (!(await isDbConnected())) {
      const response = NextResponse.json(
        { error: 'Database unavailable', code: 'DB_CONNECTION_FAILED' },
        { status: 503 }
      );
      return setCorsHeaders(response, origin || undefined);
    }

    const db = await getDb();
    
    // Get query parameters for pagination
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    
    const scores = await db
      .collection('leaderboard')
      .find({}, { projection: { _id: 0 } })
      .sort({ score: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    const rankedScores = scores.map((entry, i) => ({ 
      rank: offset + i + 1, 
      ...entry 
    }));
    
    const response = NextResponse.json({
      success: true,
      data: rankedScores,
      meta: {
        count: rankedScores.length,
        limit,
        offset
      }
    });
    
    return setCorsHeaders(response, origin || undefined);
    
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    const response = NextResponse.json(
      { 
        error: 'Failed to fetch leaderboard',
        code: 'FETCH_FAILED',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
    return setCorsHeaders(response, origin || undefined);
  }
}

/**
 * POST /api/leaderboard - Add new score
 * Validates input and manages leaderboard size
 */
export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  
  try {
    // Check database connection
    if (!(await isDbConnected())) {
      const response = NextResponse.json(
        { error: 'Database unavailable', code: 'DB_CONNECTION_FAILED' },
        { status: 503 }
      );
      return setCorsHeaders(response, origin || undefined);
    }

    const body = await req.json();
    const { name, score } = body;
    
    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      const response = NextResponse.json(
        { error: 'Name is required and must be a non-empty string', code: 'INVALID_NAME' },
        { status: 400 }
      );
      return setCorsHeaders(response, origin || undefined);
    }
    
    if (typeof score !== 'number' || score < 0 || !Number.isInteger(score)) {
      const response = NextResponse.json(
        { error: 'Score must be a non-negative integer', code: 'INVALID_SCORE' },
        { status: 400 }
      );
      return setCorsHeaders(response, origin || undefined);
    }
    
    // Sanitize name input
    const sanitizedName = name.trim().substring(0, 50); // Limit length
    
    const db = await getDb();
    const collection = db.collection('leaderboard');
    
    // Insert new score with timestamp
    const newEntry = {
      name: sanitizedName,
      score,
      timestamp: new Date(),
      userAgent: req.headers.get('user-agent') || 'unknown'
    };
    
    await collection.insertOne(newEntry);
    
    // Maintain top 100 scores only
    const totalCount = await collection.countDocuments();
    if (totalCount > 100) {
      const scoresToKeep = await collection
        .find({})
        .sort({ score: -1 })
        .limit(100)
        .toArray();
      
      if (scoresToKeep.length > 0) {
        const minScoreToKeep = scoresToKeep[scoresToKeep.length - 1].score;
        await collection.deleteMany({ 
          score: { $lt: minScoreToKeep } 
        });
      }
    }
    
    // Get the rank of the new score
    const rank = await collection.countDocuments({ score: { $gt: score } }) + 1;
    
    const response = NextResponse.json({
      success: true,
      data: {
        name: sanitizedName,
        score,
        rank,
        timestamp: newEntry.timestamp
      }
    });
    
    return setCorsHeaders(response, origin || undefined);
    
  } catch (error) {
    console.error('Leaderboard POST error:', error);
    
    // Handle specific MongoDB errors
    if (error instanceof Error && error.message.includes('E11000')) {
      const response = NextResponse.json(
        { error: 'Duplicate entry', code: 'DUPLICATE_ENTRY' },
        { status: 409 }
      );
      return setCorsHeaders(response, origin || undefined);
    }
    
    const response = NextResponse.json(
      { 
        error: 'Failed to save score',
        code: 'SAVE_FAILED',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
    return setCorsHeaders(response, origin || undefined);
  }
}
