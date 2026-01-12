"use client"

import { useState, useEffect } from "react"
import RoomList from "./Rooms"
import InstructorCalendar from "./InstructorCalendar"
import styles from "./RoomAvailability.module.css"
import { useOutletContext } from "react-router-dom"
import { api } from "./api/config"

const RoomAvailability = ({ theme: propTheme }) => {
  const context = useOutletContext()
  const theme = propTheme || context?.theme

  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [bookingsData, roomsData] = await Promise.all([api.getMyBookings(), api.getRooms()])
        setBookings(bookingsData)
        setRooms(roomsData)
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className={`${styles.roomsContainer} ${styles[theme]}`}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className={`${styles.roomsContainer} ${styles[theme]}`}>
      <div className={styles.header}>
        <h2>Room Availability</h2>
      </div>
      <div className={styles.availabilityContent}>
        <div className={styles.roomListWrapper}>
          <RoomList theme={theme} rooms={rooms} bookings={bookings} />
        </div>
        <div className={styles.calendarWrapper}>
          <InstructorCalendar theme={theme} bookings={bookings} />
        </div>
      </div>
    </div>
  )
}

export default RoomAvailability
