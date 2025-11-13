import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import path from 'path'
import fs from 'fs'

async function runMigrations() {
  const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './data/app.db'
  const dbDir = path.dirname(dbPath)

  // Ensure data directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
    console.log(`Created database directory: ${dbDir}`)
  }

  const sqlite = new Database(dbPath)
  const db = drizzle(sqlite)

  console.log('Running migrations...')

  try {
    migrate(db, { migrationsFolder: './src/db/migrations' })
    console.log('Migrations completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    sqlite.close()
  }
}

runMigrations()
