"use client"

import React from "react"
import styles from "./TimelineView.module.css"

const timeSlots = Array.from({ length: 21 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2)
  const minute = i % 2 === 0 ? "00" : "30"
  return `${String(hour).padStart(2, "0")}:${minute}`
})

const TimelineView = ({ theme, selection, onSlotClick, rooms = [], bookings = [] }) => {
  const date = selection?.date

  const dailyBookings = bookings.filter((b) => b.date === date && b.status !== "cancelled")

  const timeToIndex = (time) => {
    const [hour, minute] = time.split(":").map(Number)
    return (hour - 8) * 2 + minute / 30 + 1
  }

  return (
    <div className={`${styles.timelineContainer} ${styles[theme]}`}>
      <div className={styles.timelineGrid}>
        <div className={styles.headerCell}>Room</div>
        {timeSlots.map((time) => (
          <div key={time} className={styles.headerCell}>
            {time}
          </div>
        ))}

        {rooms.map((room) => (
          <React.Fragment key={room.id}>
            <div className={`${styles.roomCell} ${styles[theme]}`}>{room.name}</div>
            <div className={styles.roomRow}>
              {timeSlots.map((time, index) => (
                <div
                  key={time}
                  className={styles.timeSlot}
                  onClick={() => {
                    const nextTime = timeSlots[index + 1] || time
                    onSlotClick(room, time, nextTime)
                  }}
                ></div>
              ))}
              {dailyBookings
                .filter((b) => room.id === b.room_id)
                .map((booking) => {
                  const startColumn = timeToIndex(booking.start_time)
                  const endColumn = timeToIndex(booking.end_time)
                  return (
                    <div
                      key={booking.id}
                      className={styles.booking}
                      style={{ gridColumn: `${startColumn} / ${endColumn}` }}
                    >
                      {booking.class_name}
                    </div>
                  )
                })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default TimelineView
