// Database connection for Express server
import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "classer",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Helper function to execute queries
export async function query(sql, params = []) {
  const [results] = await pool.execute(sql, params)
  return results
}

// Helper function to get a single row
export async function queryOne(sql, params = []) {
  const results = await query(sql, params)
  return results[0] || null
}

// Export the pool for transactions
export default pool
