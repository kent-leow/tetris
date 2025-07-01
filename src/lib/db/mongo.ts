// src/lib/db/mongo.ts
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://tetris:tetrispass@localhost:27017/tetris?authSource=admin';
let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  db = client.db();
  return db;
}
