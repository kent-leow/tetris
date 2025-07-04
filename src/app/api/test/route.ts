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