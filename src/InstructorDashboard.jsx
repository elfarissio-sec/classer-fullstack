"use client"

import { useOutletContext, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import styles from "./InstructorDashboard.module.css"
import { useAuth } from "./context/AuthContext"
import { api } from "./api/config"

const InstructorDashboard = () => {
  const { user } = useAuth()
  const { theme } = useOutletContext()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const instructorName = user?.name || "Instructor"
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await api.getInstructorStats()
        setStats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleBookRoomClick = () => {
    navigate("/instructor/book")
  }

  const handleMyBookingsClick = () => {
    navigate("/instructor/bookings")
  }

  const handleFindRoomClick = () => {
    navigate("/instructor/rooms")
  }

  return (
    <div className={styles.dashboardWrapper}>
      <div className={`${styles.headerSection} ${styles[theme]}`}>
        <h2>Hello, {instructorName}!</h2>
        <p className={styles.currentDate}>{currentDate}</p>
      </div>
      <div className={styles.dashboardGrid}>
        <div className={styles.leftColumn}>
          <div className={`${styles.keyStatsCardsSection} ${styles[theme]}`}>
            <h3>Key Stats</h3>
            {loading ? (
              <p>Loading stats...</p>
            ) : error ? (
              <p>Error loading stats</p>
            ) : (
              <div className={styles.statsContainer}>
                <div className={styles.statCard}>
                  <span className={styles.icon}>🗓️</span>
                  <p className={styles.value}>{stats?.totalBookings || 0}</p>
                  <p className={styles.label}>Total Bookings</p>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.icon}>⏰</span>
                  <p className={styles.value}>{stats?.upcomingBookings || 0}</p>
                  <p className={styles.label}>Upcoming Classes</p>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.icon}>✓</span>
                  <p className={styles.value}>{stats?.confirmedBookings || 0}</p>
                  <p className={styles.label}>Confirmed Bookings</p>
                </div>
              </div>
            )}
          </div>

          <div className={`${styles.quickActionsPanelSection} ${styles[theme]}`}>
            <h3>Quick Actions</h3>
            <div className={styles.actionsContainer}>
              <button className={styles.actionButton} onClick={handleBookRoomClick}>
                Book a Room
              </button>
              <button className={styles.actionButton} onClick={handleMyBookingsClick}>
                My Bookings
              </button>
              <button className={styles.actionButton} onClick={handleFindRoomClick}>
                Find Available Room
              </button>
            </div>
          </div>

          <div className={`${styles.todaysScheduleSection} ${styles[theme]}`}>
            <h3>Next Booking</h3>
            {loading ? (
              <p>Loading...</p>
            ) : stats?.nextBooking ? (
              <div className={styles.scheduleItems}>
                <div className={styles.scheduleItem}>
                  <p>
                    {stats.nextBooking.start_time} - {stats.nextBooking.end_time}
                  </p>
                  <p>
                    {stats.nextBooking.room_name} - {stats.nextBooking.class_name}
                  </p>
                  <p>{stats.nextBooking.student_count} Students</p>
                  <div className={styles.itemActions}>
                    <button onClick={() => navigate("/instructor/bookings")}>View Details</button>
                  </div>
                </div>
              </div>
            ) : (
              <p className={styles.summary}>No upcoming bookings</p>
            )}
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={`${styles.upcomingBookingsSection} ${styles[theme]}`}>
            <h3>Recent Bookings</h3>
            <div className={styles.bookingsList}>
              {loading ? (
                <p>Loading...</p>
              ) : stats?.recentBookings?.length > 0 ? (
                stats.recentBookings.map((booking) => (
                  <div key={booking.id} className={styles.bookingGroup}>
                    <h4>{booking.date}</h4>
                    <p>
                      {booking.start_time} | {booking.room_name} | {booking.class_name}
                    </p>
                  </div>
                ))
              ) : (
                <p>No recent bookings</p>
              )}
            </div>
            <a href="#" className={styles.viewAllLink} onClick={() => navigate("/instructor/bookings")}>
              View All Bookings
            </a>
          </div>

          <div className={`${styles.roomAvailabilityQuickViewSection} ${styles[theme]}`}>
            <h3>Booking Status</h3>
            <div className={styles.roomStatusList}>
              <div className={styles.roomStatusItem}>
                <span className={styles.statusIndicatorGreen}>🟢</span>
                <span>Confirmed: {stats?.confirmedBookings || 0}</span>
              </div>
              <div className={styles.roomStatusItem}>
                <span className={styles.statusIndicatorGreen}>🟡</span>
                <span>Pending: {stats?.pendingBookings || 0}</span>
              </div>
            </div>
            <a href="#" className={styles.viewAllLink} onClick={() => navigate("/instructor/rooms")}>
              View Room Availability
            </a>
          </div>

          <div className={`${styles.notificationsPanelSection} ${styles[theme]}`}>
            <h3>
              Notifications <span className={styles.unreadCountBadge}>{stats?.pendingBookings || 0}</span>
            </h3>
            <div className={styles.notificationItems}>
              {stats?.pendingBookings > 0 && (
                <div className={styles.notificationItem}>
                  <span className={styles.notificationIcon}>🔔</span>
                  <p>You have {stats.pendingBookings} pending booking(s) awaiting confirmation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstructorDashboard
