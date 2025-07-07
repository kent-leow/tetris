// src/app/api/testing/route.ts
import { NextResponse } from 'next/server';

/**
 * Testing endpoint for environment variable debugging
 * Returns MongoDB URI configuration status
 */
export async function GET() {
  const startTime = Date.now();
  
  try {
    const mongoUri = process.env.MONGODB_URI ?? 'NOT_DEFINED';
    const responseTime = Date.now() - startTime;
    
    const testingResponse = {
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        mongodbUri: mongoUri,
        environment: process.env.NODE_ENV || 'development',
        responseTime: responseTime
      }
    };
    
    return NextResponse.json(testingResponse, { status: 200 });
    
  } catch (error) {
    console.error('Testing endpoint failed:', error);
    
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Testing endpoint failed',
      responseTime: Date.now() - startTime,
      environment: process.env.NODE_ENV || 'development'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
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
