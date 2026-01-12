// Booking Management Routes
import express from "express"
import { query, queryOne } from "../db.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Get all bookings (with filters)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, date, roomId, userId } = req.query

    let sql = `
      SELECT 
        b.*,
        u.name as user_name,
        u.email as user_email,
        r.name as room_name,
        r.capacity as room_capacity,
        r.location as room_location
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      WHERE 1=1
    `
    const params = []

    // Only admins can see all bookings, instructors see their own
    if (req.user.role !== "admin") {
      sql += " AND b.user_id = ?"
      params.push(req.user.id)
    } else if (userId) {
      sql += " AND b.user_id = ?"
      params.push(userId)
    }

    if (status) {
      sql += " AND b.status = ?"
      params.push(status)
    }
    if (date) {
      sql += " AND b.date = ?"
      params.push(date)
    }
    if (roomId) {
      sql += " AND b.room_id = ?"
      params.push(roomId)
    }

    sql += " ORDER BY b.date DESC, b.start_time DESC"

    const bookings = await query(sql, params)
    res.json(bookings)
  } catch (error) {
    console.error("Get bookings error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get my bookings (for instructors)
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const sql = `
      SELECT 
        b.*,
        r.name as room_name,
        r.capacity as room_capacity,
        r.location as room_location
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.user_id = ?
      ORDER BY b.date DESC, b.start_time DESC
    `

    const bookings = await query(sql, [req.user.id])
    res.json(bookings)
  } catch (error) {
    console.error("Get my bookings error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single booking
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const sql = `
      SELECT 
        b.*,
        u.name as user_name,
        u.email as user_email,
        r.name as room_name,
        r.capacity as room_capacity,
        r.location as room_location
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
    `

    const booking = await queryOne(sql, [id])

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Only admin or booking owner can view
    if (req.user.role !== "admin" && booking.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json(booking)
  } catch (error) {
    console.error("Get booking error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create booking
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { roomId, date, startTime, endTime, duration, className, subject, studentCount, notes } = req.body

    if (!roomId || !date || !startTime || !endTime || !className) {
      return res.status(400).json({
        message: "Room, date, start time, end time and class name are required",
      })
    }

    // Check room exists
    const room = await queryOne("SELECT * FROM rooms WHERE id = ?", [roomId])
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    // Check for conflicts
    const conflictSql = `
      SELECT id FROM bookings 
      WHERE room_id = ? 
        AND date = ? 
        AND status != 'cancelled'
        AND (
          (start_time < ? AND end_time > ?) OR
          (start_time >= ? AND start_time < ?) OR
          (end_time > ? AND end_time <= ?)
        )
    `
    const conflicts = await query(conflictSql, [
      roomId,
      date,
      endTime,
      startTime,
      startTime,
      endTime,
      startTime,
      endTime,
    ])

    if (conflicts.length > 0) {
      return res.status(409).json({ message: "Room is not available at this time" })
    }

    // Calculate duration if not provided
    const calculatedDuration =
      duration ||
      (() => {
        const start = new Date(`2000-01-01T${startTime}`)
        const end = new Date(`2000-01-01T${endTime}`)
        return (end - start) / (1000 * 60 * 60)
      })()

    // Create booking
    const result = await query(
      `INSERT INTO bookings 
        (user_id, room_id, date, start_time, end_time, duration, class_name, subject, student_count, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        req.user.id,
        roomId,
        date,
        startTime,
        endTime,
        calculatedDuration,
        className,
        subject || null,
        studentCount || 0,
        notes || null,
      ],
    )

    // Return created booking with details
    const newBooking = await queryOne(
      `
      SELECT 
        b.*,
        r.name as room_name,
        r.capacity as room_capacity,
        r.location as room_location
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
    `,
      [result.insertId],
    )

    res.status(201).json(newBooking)
  } catch (error) {
    console.error("Create booking error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update booking
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { roomId, date, startTime, endTime, duration, className, subject, studentCount, notes } = req.body

    // Get existing booking
    const existingBooking = await queryOne("SELECT * FROM bookings WHERE id = ?", [id])
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Only admin or booking owner can update
    if (req.user.role !== "admin" && existingBooking.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    // Check for conflicts if time/room changed
    if (roomId || date || startTime || endTime) {
      const checkRoomId = roomId || existingBooking.room_id
      const checkDate = date || existingBooking.date
      const checkStartTime = startTime || existingBooking.start_time
      const checkEndTime = endTime || existingBooking.end_time

      const conflictSql = `
        SELECT id FROM bookings 
        WHERE room_id = ? 
          AND date = ? 
          AND status != 'cancelled'
          AND id != ?
          AND (
            (start_time < ? AND end_time > ?) OR
            (start_time >= ? AND start_time < ?) OR
            (end_time > ? AND end_time <= ?)
          )
      `
      const conflicts = await query(conflictSql, [
        checkRoomId,
        checkDate,
        id,
        checkEndTime,
        checkStartTime,
        checkStartTime,
        checkEndTime,
        checkStartTime,
        checkEndTime,
      ])

      if (conflicts.length > 0) {
        return res.status(409).json({ message: "Room is not available at this time" })
      }
    }

    // Build update query
    const updates = []
    const params = []

    if (roomId !== undefined) {
      updates.push("room_id = ?")
      params.push(roomId)
    }
    if (date !== undefined) {
      updates.push("date = ?")
      params.push(date)
    }
    if (startTime !== undefined) {
      updates.push("start_time = ?")
      params.push(startTime)
    }
    if (endTime !== undefined) {
      updates.push("end_time = ?")
      params.push(endTime)
    }
    if (duration !== undefined) {
      updates.push("duration = ?")
      params.push(duration)
    }
    if (className !== undefined) {
      updates.push("class_name = ?")
      params.push(className)
    }
    if (subject !== undefined) {
      updates.push("subject = ?")
      params.push(subject)
    }
    if (studentCount !== undefined) {
      updates.push("student_count = ?")
      params.push(studentCount)
    }
    if (notes !== undefined) {
      updates.push("notes = ?")
      params.push(notes)
    }

    // Mark as modified if any significant changes
    if (roomId || date || startTime || endTime) {
      updates.push("status = 'modified'")
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" })
    }

    params.push(id)
    await query(`UPDATE bookings SET ${updates.join(", ")} WHERE id = ?`, params)

    // Return updated booking
    const updatedBooking = await queryOne(
      `
      SELECT 
        b.*,
        r.name as room_name,
        r.capacity as room_capacity,
        r.location as room_location
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
    `,
      [id],
    )

    res.json(updatedBooking)
  } catch (error) {
    console.error("Update booking error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update booking status
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!["pending", "confirmed", "cancelled", "modified"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    // Get existing booking
    const existingBooking = await queryOne("SELECT * FROM bookings WHERE id = ?", [id])
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Only admin can confirm, but owner can cancel
    if (status === "confirmed" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can confirm bookings" })
    }

    if (req.user.role !== "admin" && existingBooking.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    await query("UPDATE bookings SET status = ? WHERE id = ?", [status, id])

    res.json({ message: "Status updated successfully", status })
  } catch (error) {
    console.error("Update booking status error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete booking
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Get existing booking
    const existingBooking = await queryOne("SELECT * FROM bookings WHERE id = ?", [id])
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Only admin or booking owner can delete
    if (req.user.role !== "admin" && existingBooking.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    await query("DELETE FROM bookings WHERE id = ?", [id])

    res.json({ message: "Booking deleted successfully" })
  } catch (error) {
    console.error("Delete booking error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
