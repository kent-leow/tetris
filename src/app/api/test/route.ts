import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    return NextResponse.json(
      { 
        uri: process.env.MONGODB_URI ?? 'NOT_DEFINED',
        status: 'success',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (_error) {
    return NextResponse.json(
      { 
        error: 'Internal server error',
        status: 'error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}