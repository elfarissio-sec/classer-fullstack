// JWT Authentication utilities
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-in-production"
const JWT_EXPIRES_IN = "7d"

// Hash password
export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

// Compare password with hash
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  )
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Extract token from Authorization header
export function extractToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  return authHeader.substring(7)
}

// Middleware helper to get user from request
export function getUserFromToken(authHeader) {
  const token = extractToken(authHeader)
  if (!token) return null
  return verifyToken(token)
}
