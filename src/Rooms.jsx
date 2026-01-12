"use client"

import { useState, useEffect } from "react"
import styles from "./Rooms.module.css"
import { FaUsers, FaChalkboard, FaDesktop, FaMapMarkerAlt, FaTv } from "react-icons/fa"
import { useOutletContext } from "react-router-dom"
import { api } from "./api/config"

const getRoomStatus = (room, selection, bookings) => {
  if (!selection || !selection.date || !selection.startTime || !selection.endTime) {
    return { text: room.status, className: room.status.toLowerCase() }
  }

  const roomBookings = bookings.filter((b) => b.room_id === room.id && b.date === selection.date)

  if (roomBookings.length === 0) {
    return { text: "Available", className: "available" }
  }

  const selectionStart = new Date(`${selection.date}T${selection.startTime}`)
  const selectionEnd = new Date(`${selection.date}T${selection.endTime}`)

  let totalSlots = 0
  let occupiedSlots = 0

  for (let time = new Date(selectionStart); time < selectionEnd; time.setMinutes(time.getMinutes() + 30)) {
    totalSlots++
    const slotStart = new Date(time)
    const slotEnd = new Date(slotStart)
    slotEnd.setMinutes(slotEnd.getMinutes() + 30)

    const isOccupied = roomBookings.some((booking) => {
      const bookingStart = new Date(`${booking.date}T${booking.start_time}`)
      const bookingEnd = new Date(`${booking.date}T${booking.end_time}`)
      return slotStart < bookingEnd && slotEnd > bookingStart
    })

    if (isOccupied) {
      occupiedSlots++
    }
  }

  if (totalSlots === 0 || occupiedSlots === 0) {
    return { text: "Available", className: "available" }
  }
  if (occupiedSlots === totalSlots) {
    return { text: "Occupied", className: "occupied" }
  }
  return { text: "Partial", className: "partial" }
}

const Rooms = ({ selection, rooms: propRooms, bookings: propBookings }) => {
  const { theme } = useOutletContext()
  const [rooms, setRooms] = useState(propRooms || [])
  const [bookings, setBookings] = useState(propBookings || [])
  const [loading, setLoading] = useState(!propRooms)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!propRooms) {
      const fetchData = async () => {
        try {
          setLoading(true)
          const [roomsData, bookingsData] = await Promise.all([api.getRooms(), api.getBookings()])
          setRooms(roomsData)
          setBookings(bookingsData)
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [propRooms])

  // Update when props change
  useEffect(() => {
    if (propRooms) setRooms(propRooms)
    if (propBookings) setBookings(propBookings)
  }, [propRooms, propBookings])

  if (loading) {
    return (
      <div className={`${styles.roomListContainer} ${styles[theme]}`}>
        <p>Loading rooms...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${styles.roomListContainer} ${styles[theme]}`}>
        <p className={styles.error}>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className={`${styles.roomListContainer} ${styles[theme]}`}>
      <div className={styles.filters}>
        <select>
          <option>All Capacities</option>
        </select>
        <select>
          <option>All Equipment</option>
        </select>
      </div>
      <div className={styles.roomGrid}>
        {rooms.map((room) => {
          const status = getRoomStatus(room, selection, bookings)
          return (
            <div key={room.id} className={styles.roomCard}>
              <h4>{room.name}</h4>
              <p>
                <FaMapMarkerAlt /> {room.location}
              </p>
              <p>
                <FaUsers /> Capacity: {room.capacity}
              </p>
              <div className={styles.equipment}>
                {room.equipment?.includes("projector") && <FaTv title="Projector" />}
                {room.equipment?.includes("whiteboard") && <FaChalkboard title="Whiteboard" />}
                {room.equipment?.includes("computers") && <FaDesktop title="Computers" />}
              </div>
              <span className={`${styles.status} ${styles[status.className]}`}>{status.text}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Rooms
