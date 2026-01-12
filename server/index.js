// Main Express Server Entry Point
import express from "express"
import cors from "cors"
import dotenv from "dotenv"

// Import routes
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import roomRoutes from "./routes/rooms.js"
import bookingRoutes from "./routes/bookings.js"
import dashboardRoutes from "./routes/dashboard.js"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/rooms", roomRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/dashboard", dashboardRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!", error: err.message })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
