// src/lib/db/mongo.ts
import { MongoClient, Db, MongoClientOptions } from 'mongodb';

/**
 * MongoDB connection configuration and utilities
 * Implements connection pooling and proper error handling for production deployment
 */

// Environment-based configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://tetris:tetrispass@localhost:27017/tetris?authSource=admin';
const DB_NAME = process.env.MONGODB_DB_NAME || 'tetris';

// Connection options optimized for Vercel serverless environment
const clientOptions: MongoClientOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};

// Global variables to maintain connection across serverless invocations
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

/**
 * Creates and maintains a MongoDB client connection
 * Implements singleton pattern for serverless environments
 */
async function getClient(): Promise<MongoClient> {
  if (client) {
    try {
      // Test if connection is still alive
      await client.db('admin').command({ ping: 1 });
      return client;
    } catch (error) {
      console.log('Existing connection failed, creating new one');
      client = null;
      clientPromise = null;
    }
  }

  if (clientPromise) {
    return clientPromise;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    clientPromise = MongoClient.connect(MONGODB_URI, clientOptions);
    client = await clientPromise;
    
    // Set up connection event listeners
    client.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    client.on('close', () => {
      console.log('MongoDB connection closed');
      client = null;
      clientPromise = null;
    });

    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    clientPromise = null;
    throw error;
  }
}

/**
 * Gets the database instance with proper error handling
 * @returns Promise<Db> - MongoDB database instance
 */
export async function getDb(): Promise<Db> {
  try {
    const mongoClient = await getClient();
    return mongoClient.db(DB_NAME);
  } catch (error) {
    console.error('Failed to get database:', error);
    throw new Error('Database connection failed');
  }
}

/**
 * Health check function for database connectivity
 * @returns Promise<boolean> - Connection status
 */
export async function isDbConnected(): Promise<boolean> {
  try {
    const db = await getDb();
    await db.admin().ping();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Gracefully close the database connection
 * Useful for cleanup in non-serverless environments
 */
export async function closeDbConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    clientPromise = null;
  }
}
