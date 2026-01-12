// Authentication Routes
import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { query, queryOne } from "../db.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-in-production"
const JWT_EXPIRES_IN = "7d"

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    // Find user by email
    const user = await queryOne("SELECT * FROM users WHERE email = ?", [email])

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    )

    // Return user data (without password) and token
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error during login" })
  }
})

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "instructor" } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" })
    }

    // Check if user already exists
    const existingUser = await queryOne("SELECT id FROM users WHERE email = ?", [email])

    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new user
    const result = await query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [
      name,
      email,
      hashedPassword,
      role,
    ])

    // Generate token
    const token = jwt.sign(
      {
        id: result.insertId,
        email,
        role,
        name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    )

    res.status(201).json({
      user: {
        id: result.insertId,
        name,
        email,
        role,
      },
      token,
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ message: "Server error during registration" })
  }
})

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await queryOne("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [req.user.id])

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
