import { Pool } from 'pg'

const globalForPool = globalThis as unknown as { pgPool: Pool }

export const pool =
  globalForPool.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  })

if (process.env.NODE_ENV !== 'production') globalForPool.pgPool = pool

// Helper: run a query and return rows
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query(sql, params)
  return result.rows as T[]
}

// Helper: run a query and return first row or null
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await pool.query(sql, params)
  return (result.rows[0] as T) ?? null
}
