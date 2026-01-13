"use client"

import { useState, useEffect, useMemo } from "react"
import styles from "./Rooms.module.css"
import { FaUsers, FaChalkboard, FaDesktop, FaMapMarkerAlt, FaTv } from "react-icons/fa"
import { useOutletContext } from "react-router-dom"
import { api } from "./api/config"

// const getRoomStatus = (room, selection, bookings) => {
//   if (!selection || !selection.date || !selection.startTime || !selection.endTime) {
//     return { text: room.status, className: room.status.toLowerCase() }
//   }

//   const roomBookings = bookings.filter((b) => b.room_id === room.id && b.date === selection.date)

//   if (roomBookings.length === 0) {
//     return { text: "Available", className: "available" }
//   }

//   const selectionStart = new Date(`${selection.date}T${selection.startTime}`)
//   const selectionEnd = new Date(`${selection.date}T${selection.endTime}`)

//   let totalSlots = 0
//   let occupiedSlots = 0

//   for (let time = new Date(selectionStart); time < selectionEnd; time.setMinutes(time.getMinutes() + 30)) {
//     totalSlots++
//     const slotStart = new Date(time)
//     const slotEnd = new Date(slotStart)
//     slotEnd.setMinutes(slotEnd.getMinutes() + 30)

//     const isOccupied = roomBookings.some((booking) => {
//       const bookingStart = new Date(`${booking.date}T${booking.start_time}`)
//       const bookingEnd = new Date(`${booking.date}T${booking.end_time}`)
//       return slotStart < bookingEnd && slotEnd > bookingStart
//     })

//     if (isOccupied) {
//       occupiedSlots++
//     }
//   }

//   if (totalSlots === 0 || occupiedSlots === 0) {
//     return { text: "Available", className: "available" }
//   }
//   if (occupiedSlots === totalSlots) {
//     return { text: "Occupied", className: "occupied" }
//   }
//   return { text: "Partial", className: "partial" }
// }

// Nouvelle fonction pour vérifier si une salle est disponible MAINTENANT
const isRoomAvailableNow = (room, bookings) => {
  const now = new Date()
  const today = now.toISOString().split('T')[0] // Format YYYY-MM-DD
  
  // Filtrer les réservations de cette salle pour aujourd'hui
  const todayBookings = bookings.filter(
    (b) => b.room_id === room.id && b.date.split("T")[0] === today && b.status !== 'cancelled'
  )

  // Si aucune réservation aujourd'hui, la salle est disponible
  if (todayBookings.length === 0) {
    return true
  }

  // Vérifier si l'heure actuelle est dans un créneau réservé
  const currentTime = now.getHours() * 60 + now.getMinutes() // Minutes depuis minuit

  const isOccupied = todayBookings.some((booking) => {
    // Convertir start_time et end_time en minutes
    const [startHour, startMin] = booking.start_time.split(':').map(Number)
    const [endHour, endMin] = booking.end_time.split(':').map(Number)
    
    const bookingStart = startHour * 60 + startMin
    const bookingEnd = endHour * 60 + endMin


    // Vérifier si l'heure actuelle est dans ce créneau
    return currentTime >= bookingStart && currentTime < bookingEnd
  })

  return !isOccupied
}

const Rooms = ({ rooms: propRooms, bookings: propBookings }) => {
  const { theme } = useOutletContext()
  const [rooms, setRooms] = useState(propRooms || [])
  const [bookings, setBookings] = useState(propBookings || [])
  const [loading, setLoading] = useState(!propRooms)
  const [error, setError] = useState(null)
  
  // Nouveau state pour le filtre
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)

  useEffect(() => {
    if (!propRooms) {
      const fetchData = async () => {
        try {
          setLoading(true)
          const [roomsData, bookingsData] = await Promise.all([
            api.getRooms(), 
            api.getBookings()
          ])
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

  // Filtrer les salles disponibles maintenant
  const filteredRooms = useMemo(() => {
    if (!showOnlyAvailable) {
      return rooms
    }
    
    return rooms.filter((room) => isRoomAvailableNow(room, bookings))
  }, [rooms, bookings, showOnlyAvailable])

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
        
        {/* Nouveau toggle pour afficher uniquement les salles disponibles */}
        <label className={styles.toggleFilter}>
          <input
            type="checkbox"
            checked={showOnlyAvailable}
            onChange={(e) => setShowOnlyAvailable(e.target.checked)}
          />
          <span>Show only available now</span>
        </label>
      </div>

      {/* Message si aucune salle disponible */}
      {showOnlyAvailable && filteredRooms.length === 0 && (
        <div className={styles.noRooms}>
          <p>No rooms available right now. Please try again later.</p>
        </div>
      )}

      <div className={styles.roomGrid}>
        {filteredRooms.map((room) => {
          const isCurrentlyAvailable = isRoomAvailableNow(room, bookings)
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
              
              {/* Afficher le statut actuel */}
              <div className={styles.statusContainer}>
                <span className={`${styles.status} ${styles[isCurrentlyAvailable ? 'available' : 'occupied']}`}>
                  {isCurrentlyAvailable ? "Available" : "Occupied"}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Rooms