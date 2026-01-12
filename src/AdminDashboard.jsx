"use client"

import { useOutletContext } from "react-router-dom"
import { useState, useEffect } from "react"
import styles from "./AdminDashboard.module.css"
import Bookings from "./Bookings"
import AdminCalendar from "./AdminCalendar"
import "./Dashboard.css"
import { api } from "./api/config"

const AdminDashboard = () => {
  const { theme } = useOutletContext()

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await api.getDashboardStats()
        setStats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleAddRoom = () => {
    alert("Add Room functionality - navigate to room management")
  }

  const handleBlockRoom = () => {
    alert("Block Room functionality would go here.")
  }

  const handleApproveException = () => {
    alert("Approve Exception functionality would go here.")
  }

  if (loading) {
    return (
      <div className={`${styles.adminDashboardContainer} ${styles[theme]}`}>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${styles.adminDashboardContainer} ${styles[theme]}`}>
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className={`${styles.adminDashboardContainer} ${styles[theme]}`}>
      <h2 className={styles.sectionTitle}>Admin Dashboard Overview</h2>

      <div className={styles.overviewCards}>
        <div className={styles.card}>
          <h3>Total Bookings Today</h3>
          <p>{stats?.todaysBookings || 0}</p>
        </div>
        <div className={styles.card}>
          <h3>Pending Bookings</h3>
          <p>{stats?.pendingBookings || 0}</p>
        </div>
        <div className={styles.card}>
          <h3>Total Rooms</h3>
          <p>{stats?.totalRooms || 0}</p>
        </div>
        <div className={styles.card}>
          <h3>Active Instructors</h3>
          <p>{stats?.activeInstructors || 0}</p>
        </div>
      </div>

      <div>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.quickActions}>
          <button className={styles.quickActionButton} onClick={handleAddRoom}>
            Add Room
          </button>
          <button className={styles.quickActionButton} onClick={handleBlockRoom}>
            Block Room
          </button>
          <button className={styles.quickActionButton} onClick={handleApproveException}>
            Approve Exception
          </button>
        </div>
      </div>

      <div>
        <h3 className={styles.sectionTitle}>Booking Status Overview</h3>
        <div className={styles.eventsList}>
          <ul>
            <li>
              <strong>Confirmed:</strong> {stats?.bookingsByStatus?.confirmed || 0}
            </li>
            <li>
              <strong>Pending:</strong> {stats?.bookingsByStatus?.pending || 0}
            </li>
            <li>
              <strong>Cancelled:</strong> {stats?.bookingsByStatus?.cancelled || 0}
            </li>
            <li>
              <strong>Modified:</strong> {stats?.bookingsByStatus?.modified || 0}
            </li>
          </ul>
        </div>
      </div>

      <Bookings theme={theme} />
      <AdminCalendar theme={theme} />
    </div>
  )
}

export default AdminDashboard
