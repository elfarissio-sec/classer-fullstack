// Authentication Middleware
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-in-production"

// Verify JWT token middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access token required" })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

// Check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}

// Check if user is instructor or admin
export const requireInstructorOrAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "instructor") {
    return res.status(403).json({ message: "Instructor or admin access required" })
  }
  next()
}
