// Room Management Routes
import express from "express"
import { query, queryOne } from "../db.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// Get all rooms
router.get("/", authenticateToken, async (req, res) => {
  try {
    const rooms = await query("SELECT * FROM rooms ORDER BY name")

    // Parse equipment JSON
    const parsedRooms = rooms.map((room) => ({
      ...room,
      equipment: JSON.parse(room.equipment || "[]"),
    }))

    res.json(parsedRooms)
  } catch (error) {
    console.error("Get rooms error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single room
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const room = await queryOne("SELECT * FROM rooms WHERE id = ?", [id])

    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    room.equipment = JSON.parse(room.equipment || "[]")
    res.json(room)
  } catch (error) {
    console.error("Get room error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Check room availability
router.get("/:id/availability", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { date, startTime, endTime, excludeBookingId } = req.query

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: "Date, startTime and endTime are required" })
    }

    // Check for overlapping bookings
    let sql = `
      SELECT id, start_time, end_time, class_name 
      FROM bookings 
      WHERE room_id = ? 
        AND date = ? 
        AND status != 'cancelled'
        AND (
          (start_time < ? AND end_time > ?) OR
          (start_time >= ? AND start_time < ?) OR
          (end_time > ? AND end_time <= ?)
        )
    `
    const params = [id, date, endTime, startTime, startTime, endTime, startTime, endTime]

    if (excludeBookingId) {
      sql += " AND id != ?"
      params.push(excludeBookingId)
    }

    const conflicts = await query(sql, params)

    res.json({
      available: conflicts.length === 0,
      conflicts,
    })
  } catch (error) {
    console.error("Check availability error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create room (admin only)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, capacity, status = "available", equipment = [], location } = req.body

    if (!name || !capacity) {
      return res.status(400).json({ message: "Name and capacity are required" })
    }

    const result = await query(
      "INSERT INTO rooms (name, capacity, status, equipment, location) VALUES (?, ?, ?, ?, ?)",
      [name, capacity, status, JSON.stringify(equipment), location],
    )

    res.status(201).json({
      id: result.insertId,
      name,
      capacity,
      status,
      equipment,
      location,
    })
  } catch (error) {
    console.error("Create room error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update room (admin only)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { name, capacity, status, equipment, location } = req.body

    // Check if room exists
    const existingRoom = await queryOne("SELECT id FROM rooms WHERE id = ?", [id])
    if (!existingRoom) {
      return res.status(404).json({ message: "Room not found" })
    }

    // Build update query dynamically
    const updates = []
    const params = []

    if (name !== undefined) {
      updates.push("name = ?")
      params.push(name)
    }
    if (capacity !== undefined) {
      updates.push("capacity = ?")
      params.push(capacity)
    }
    if (status !== undefined) {
      updates.push("status = ?")
      params.push(status)
    }
    if (equipment !== undefined) {
      updates.push("equipment = ?")
      params.push(JSON.stringify(equipment))
    }
    if (location !== undefined) {
      updates.push("location = ?")
      params.push(location)
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" })
    }

    params.push(id)
    await query(`UPDATE rooms SET ${updates.join(", ")} WHERE id = ?`, params)

    // Return updated room
    const updatedRoom = await queryOne("SELECT * FROM rooms WHERE id = ?", [id])
    updatedRoom.equipment = JSON.parse(updatedRoom.equipment || "[]")

    res.json(updatedRoom)
  } catch (error) {
    console.error("Update room error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete room (admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Check for existing bookings
    const bookings = await query("SELECT id FROM bookings WHERE room_id = ? AND status != 'cancelled'", [id])

    if (bookings.length > 0) {
      return res.status(400).json({
        message: "Cannot delete room with active bookings. Cancel all bookings first.",
      })
    }

    const result = await query("DELETE FROM rooms WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Room not found" })
    }

    res.json({ message: "Room deleted successfully" })
  } catch (error) {
    console.error("Delete room error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
