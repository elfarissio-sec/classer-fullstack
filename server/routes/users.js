// User Management Routes
import express from "express"
import bcrypt from "bcryptjs"
import { query, queryOne } from "../db.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// Get all users (admin only)
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await query(
      "SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC",
    )
    res.json(users)
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single user
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Users can only view their own profile unless admin
    if (req.user.role !== "admin" && req.user.id !== Number.parseInt(id)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const user = await queryOne("SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?", [id])

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create user (admin only)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
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

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      role,
    })
  } catch (error) {
    console.error("Create user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, password, role } = req.body

    // Users can only update their own profile unless admin
    if (req.user.role !== "admin" && req.user.id !== Number.parseInt(id)) {
      return res.status(403).json({ message: "Access denied" })
    }

    // Only admin can change roles
    if (role && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can change user roles" })
    }

    // Check if user exists
    const existingUser = await queryOne("SELECT id FROM users WHERE id = ?", [id])
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if email is already taken by another user
    if (email) {
      const emailCheck = await queryOne("SELECT id FROM users WHERE email = ? AND id != ?", [email, id])
      if (emailCheck) {
        return res.status(400).json({ message: "Email already in use" })
      }
    }

    // Build update query dynamically
    const updates = []
    const params = []

    if (name) {
      updates.push("name = ?")
      params.push(name)
    }
    if (email) {
      updates.push("email = ?")
      params.push(email)
    }
    if (password) {
      updates.push("password = ?")
      params.push(await bcrypt.hash(password, 10))
    }
    if (role && req.user.role === "admin") {
      updates.push("role = ?")
      params.push(role)
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" })
    }

    params.push(id)
    await query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params)

    // Return updated user
    const updatedUser = await queryOne("SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?", [
      id,
    ])

    res.json(updatedUser)
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete user (admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Prevent admin from deleting themselves
    if (req.user.id === Number.parseInt(id)) {
      return res.status(400).json({ message: "Cannot delete your own account" })
    }

    const result = await query("DELETE FROM users WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
