import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json(
      { 
        uri: process.env.MONGODB_URI ?? 'NOT_DEFINED',
        status: 'success',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (e: unknown) {
    return NextResponse.json(
      { 
        error: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
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