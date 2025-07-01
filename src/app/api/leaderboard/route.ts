// src/app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';


import { getDb } from '../../../lib/db/mongo';


export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const scores = await db
      .collection('leaderboard')
      .find({}, { projection: { _id: 0 } })
      .sort({ score: -1 })
      .limit(100)
      .toArray();
    const sorted = scores.map((entry, i) => ({ rank: i + 1, ...entry }));
    return NextResponse.json(sorted);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, score } = await req.json();
    if (typeof name !== 'string' || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const db = await getDb();
    await db.collection('leaderboard').insertOne({ name, score });
    // Optionally: prune to top 100
    const all = await db.collection('leaderboard').find({}).sort({ score: -1 }).toArray();
    if (all.length > 100) {
      const cutoff = all[99].score;
      await db.collection('leaderboard').deleteMany({ score: { $lt: cutoff } });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
