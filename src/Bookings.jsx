"use client"

import { useOutletContext } from "react-router-dom"
import { useState, useEffect } from "react"
import styles from "./Bookings.module.css"
import { api } from "./api/config"

const Bookings = ({ theme: propTheme }) => {
  const context = useOutletContext()
  const theme = propTheme || context?.theme

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const data = await api.getBookings()
        setBookings(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  if (loading) return <div className={`${styles.bookings} ${styles[theme]}`}>Loading bookings...</div>
  if (error) return <div className={`${styles.bookings} ${styles[theme]}`}>Error: {error}</div>

  return (
    <div className={`${styles.bookings} ${styles[theme]}`}>
      <h2>Recent Bookings</h2>
      <table>
        <thead>
          <tr>
            <th>Room</th>
            <th>Date</th>
            <th>Instructor</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.slice(0, 10).map((booking) => (
            <tr key={booking.id}>
              <td>{booking.room_name}</td>
              <td>{booking.date}</td>
              <td>{booking.user_name}</td>
              <td>
                {booking.start_time} - {booking.end_time}
              </td>
              <td>
                <span className={`${styles.status} ${styles[booking.status]}`}>{booking.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Bookings
