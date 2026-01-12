// Dashboard Statistics Routes
import express from "express"
import { query, queryOne } from "../db.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// Get admin dashboard stats
router.get("/stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Total rooms
    const totalRooms = await queryOne("SELECT COUNT(*) as count FROM rooms")

    // Total users
    const totalUsers = await queryOne("SELECT COUNT(*) as count FROM users")

    // Total bookings
    const totalBookings = await queryOne("SELECT COUNT(*) as count FROM bookings")

    // Bookings by status
    const bookingsByStatus = await query("SELECT status, COUNT(*) as count FROM bookings GROUP BY status")

    // Today's bookings
    const today = new Date().toISOString().split("T")[0]
    const todaysBookings = await queryOne("SELECT COUNT(*) as count FROM bookings WHERE date = ?", [today])

    // Pending bookings
    const pendingBookings = await queryOne("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'")

    // Available rooms
    const availableRooms = await queryOne("SELECT COUNT(*) as count FROM rooms WHERE status = 'available'")

    // Active instructors (instructors with at least one booking)
    const activeInstructors = await queryOne(
      "SELECT COUNT(DISTINCT user_id) as count FROM bookings WHERE status != 'cancelled'",
    )

    // Recent bookings
    const recentBookings = await query(`
      SELECT 
        b.*,
        u.name as user_name,
        r.name as room_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `)

    // Bookings this week
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const weeklyBookings = await query(
      `SELECT DATE(date) as date, COUNT(*) as count 
       FROM bookings 
       WHERE date BETWEEN ? AND ?
       GROUP BY DATE(date)
       ORDER BY date`,
      [weekStart.toISOString().split("T")[0], weekEnd.toISOString().split("T")[0]],
    )

    res.json({
      totalRooms: totalRooms.count,
      totalUsers: totalUsers.count,
      totalBookings: totalBookings.count,
      todaysBookings: todaysBookings.count,
      pendingBookings: pendingBookings.count,
      availableRooms: availableRooms.count,
      activeInstructors: activeInstructors.count,
      bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
        acc[item.status] = item.count
        return acc
      }, {}),
      recentBookings,
      weeklyBookings,
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get instructor dashboard stats
router.get("/instructor-stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    // Total bookings for this instructor
    const totalBookings = await queryOne("SELECT COUNT(*) as count FROM bookings WHERE user_id = ?", [userId])

    // Upcoming bookings
    const today = new Date().toISOString().split("T")[0]
    const upcomingBookings = await queryOne(
      "SELECT COUNT(*) as count FROM bookings WHERE user_id = ? AND date >= ? AND status != 'cancelled'",
      [userId, today],
    )

    // Confirmed bookings
    const confirmedBookings = await queryOne(
      "SELECT COUNT(*) as count FROM bookings WHERE user_id = ? AND status = 'confirmed'",
      [userId],
    )

    // Pending bookings
    const pendingBookings = await queryOne(
      "SELECT COUNT(*) as count FROM bookings WHERE user_id = ? AND status = 'pending'",
      [userId],
    )

    // Next upcoming booking
    const nextBooking = await queryOne(
      `SELECT 
        b.*,
        r.name as room_name,
        r.location as room_location
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.user_id = ? AND b.date >= ? AND b.status != 'cancelled'
       ORDER BY b.date ASC, b.start_time ASC
       LIMIT 1`,
      [userId, today],
    )

    // Recent bookings
    const recentBookings = await query(
      `SELECT 
        b.*,
        r.name as room_name
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC
       LIMIT 5`,
      [userId],
    )

    res.json({
      totalBookings: totalBookings.count,
      upcomingBookings: upcomingBookings.count,
      confirmedBookings: confirmedBookings.count,
      pendingBookings: pendingBookings.count,
      nextBooking,
      recentBookings,
    })
  } catch (error) {
    console.error("Get instructor stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
