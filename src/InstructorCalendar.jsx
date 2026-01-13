"use client"

import { useState, useMemo } from "react"
import styles from "./AdminCalendar.module.css"

const InstructorCalendar = ({ theme, bookings = [] }) => {
  const [date, setDate] = useState(new Date())

  const getMonthData = useMemo(() => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDayRaw = new Date(year, month, 1).getDay()
    const firstDay = firstDayRaw === 0 ? 6 : firstDayRaw - 1
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { year, month, firstDay, daysInMonth }
  }, [date])

  const { year, month, firstDay, daysInMonth } = getMonthData

  const bookingsByDate = (bookings || []).reduce((acc, booking) => {
    const d = booking.date
    if (!acc[d]) {
      acc[d] = []
    }
    acc[d].push(booking)
    return acc
  }, {})

  const formatLocalDate = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  const renderDays = () => {
    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={""}></div>)
    }
    const today = new Date()
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i)
      const dateString = formatLocalDate(dayDate)
      const dayBookings = bookingsByDate[dateString] || []
      const isToday =
        dayDate.getDate() === today.getDate() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getFullYear() === today.getFullYear()
      days.push(
        <div key={i} className={`${styles.day} ${isToday ? styles.today : ""}`}>
          <div className={styles.dayNumber}>{i}</div>
          <div className={styles.bookings}>
            {dayBookings.map((booking) => (
              <div key={booking.id} className={styles.bookingItem}>
                <div className={styles.booking}>{booking.class_name || "Booking"}</div>
                <div className={styles.booking}>{booking.status || "Pending"}</div>
                <div className={styles.booking}>
                  {booking.start_time}-{booking.end_time}
                </div>
                <div className={styles.booking}>{booking.user_name || "Unknown Instructor"}</div>
              </div>
            ))}
          </div>
        </div>,
      )
    }
    return days
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const changeMonth = (offset) => {
    const newDate = new Date(date)
    newDate.setMonth(newDate.getMonth() + offset)
    setDate(newDate)
  }

  return (
    <div className={`${styles.calendarContainer} ${styles[theme]}`}>
      <div className={styles.header}>
        <button onClick={() => changeMonth(-1)}>&lt;</button>
        <h2>
          {monthNames[month]} {year}
        </h2>
        <button onClick={() => changeMonth(1)}>&gt;</button>
      </div>
      <div className={styles.daysOfWeek}>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>
      </div>
      <div className={styles.calendarGrid}>{renderDays()}</div>
    </div>
  )
}

export default InstructorCalendar
