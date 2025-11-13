import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'

// Ensure data directory exists
const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './data/app.db'
const dbDir = path.dirname(dbPath)

// Database connection singleton
let db: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (!db) {
    // Create SQLite connection
    const sqlite = new Database(dbPath)

    // Enable WAL mode for better concurrent access
    sqlite.pragma('journal_mode = WAL')

    // Create drizzle instance
    db = drizzle(sqlite, { schema })
  }

  return db
}

// Export for use in API routes and server components
export const database = getDb()
