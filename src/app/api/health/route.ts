// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { isDbConnected } from '../../../lib/db/mongo';

/**
 * Health check endpoint for deployment monitoring
 * Returns system status and database connectivity
 */
export async function GET() {
  const startTime = Date.now();
    const mongoUri = process.env.MONGODB_URI ?? 'NOT_DEFINED';
  
  try {
    // Check database connectivity
    const dbConnected = await isDbConnected();
    const responseTime = Date.now() - startTime;
    
    console.log('mongoUri:', mongoUri);
    const healthStatus = {
      status: dbConnected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbConnected ? 'up' : 'down',
          responseTime: responseTime
        },
        api: {
          status: 'up',
          responseTime: responseTime
        }
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      mongoUri: mongoUri,
    };
    
    const statusCode = dbConnected ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: statusCode });
    
  } catch (error) {
    console.error('Health check failed:', error);
    console.error('mongoUri:', mongoUri);
    
    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      responseTime: Date.now() - startTime,
      environment: process.env.NODE_ENV || 'development',
      mongoUri: mongoUri,
    };
    
    return NextResponse.json(errorStatus, { status: 503 });
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
