"use client"

import { useOutletContext } from "react-router-dom"
import { useState, useEffect } from "react"
import styles from "./MyBookings.module.css"
import InstructorCalendar from "./InstructorCalendar"
import { api } from "./api/config"
import jsPDF from "jspdf"

const EditBookingForm = ({ booking, onSave, onCancel }) => {
  const [formData, setFormData] = useState(booking)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label>Class Name</label>
        <input
          type="text"
          name="className"
          value={formData.class_name || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, class_name: e.target.value }))}
          className={styles.formInput}
        />
      </div>
      <div className={styles.formGroup}>
        <label>Subject</label>
        <input
          type="text"
          name="subject"
          value={formData.subject || ""}
          onChange={handleChange}
          className={styles.formInput}
        />
      </div>
      <div className={styles.formGroup}>
        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          className={styles.formTextarea}
        ></textarea>
      </div>
      <div className={styles.formActions}>
        <button type="submit" className={styles.actionButton}>
          Save
        </button>
        <button type="button" onClick={onCancel} className={`${styles.actionButton} ${styles.cancelButton}`}>
          Cancel
        </button>
      </div>
    </form>
  )
}

const MyBookings = ({ theme: propTheme }) => {
  const context = useOutletContext()
  const theme = propTheme || context?.theme
  const [currentView, setCurrentView] = useState("list")

  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter states
  const [filterStartDate, setFilterStartDate] = useState("")
  const [filterEndDate, setFilterEndDate] = useState("")
  const [filterRoomId, setFilterRoomId] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  // Side panel states
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Bulk selection state
  const [selectedBookingIds, setSelectedBookingIds] = useState(new Set())

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [bookingsData, roomsData] = await Promise.all([api.getMyBookings(), api.getRooms()])
        setBookings(bookingsData)
        setRooms(roomsData)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const getRoomName = (roomId) => {
    const room = rooms.find((r) => r.id === roomId)
    return room?.name || `Room ${roomId}`
  }

  const openSidePanel = (booking, editMode = false) => {
    setSelectedBooking(booking)
    setIsPanelOpen(true)
    setIsEditing(editMode)
  }

  const closeSidePanel = () => {
    setIsPanelOpen(false)
    setSelectedBooking(null)
    setIsEditing(false)
  }

  const toggleBookingSelection = (bookingId) => {
    setSelectedBookingIds((prev) => {
      const newSelection = new Set(prev)
      if (newSelection.has(bookingId)) {
        newSelection.delete(bookingId)
      } else {
        newSelection.add(bookingId)
      }
      return newSelection
    })
  }

  const today = new Date().toISOString().split("T")[0]

  const filteredBookings = (isLoading || error ? [] : bookings)
    .filter((booking) => {
      const bookingDate = booking.date
      const isBookingPast = bookingDate < today

      if (filterStartDate && bookingDate < filterStartDate) return false
      if (filterEndDate && bookingDate > filterEndDate) return false
      if (filterRoomId !== "all" && booking.room_id !== Number.parseInt(filterRoomId)) return false

      if (filterStatus === "active") {
        return !isBookingPast && (booking.status === "confirmed" || booking.status === "pending")
      }
      if (filterStatus === "past") return isBookingPast
      if (filterStatus === "cancelled") return booking.status === "cancelled"
      if (filterStatus !== "all" && booking.status !== filterStatus) return false

      return true
    })
    .map((booking) => ({
      ...booking,
      isPast: booking.date < today,
      isCancelled: booking.status === "cancelled",
      isCancellable: booking.date >= today && booking.status !== "cancelled",
    }))

  const toggleSelectAll = () => {
    const cancellableBookings = filteredBookings.filter((b) => b.isCancellable)
    if (selectedBookingIds.size === cancellableBookings.length && cancellableBookings.length > 0) {
      setSelectedBookingIds(new Set())
    } else {
      const allCancellableIds = new Set(cancellableBookings.map((b) => b.id))
      setSelectedBookingIds(allCancellableIds)
    }
  }

  const handleSaveBooking = async (updatedBooking) => {
    try {
      await api.updateBooking(updatedBooking.id, {
        className: updatedBooking.class_name,
        subject: updatedBooking.subject,
        notes: updatedBooking.notes,
      })

      setBookings((prevBookings) =>
        prevBookings.map((b) => (b.id === updatedBooking.id ? { ...b, ...updatedBooking } : b)),
      )
      setSelectedBooking({ ...selectedBooking, ...updatedBooking })
      setIsEditing(false)
    } catch (err) {
      alert(`Error saving booking: ${err.message}`)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    try {
      await api.updateBookingStatus(bookingId, "cancelled")

      setBookings((prevBookings) =>
        prevBookings.map((b) => (b.id === bookingId ? { ...b, status: "cancelled", isCancellable: false } : b)),
      )
      alert(`Booking has been cancelled.`)
      closeSidePanel()
    } catch (err) {
      alert(`Error cancelling booking: ${err.message}`)
    }
  }

  const exportBookingsAsCSV = (bookingsToExport) => {
    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += "ID,Room,Date,Start Time,End Time,Class Name,Subject,Student Count,Status,Notes\n"

    bookingsToExport.forEach((booking) => {
      csvContent += `${booking.id},${getRoomName(booking.room_id)},${booking.date},${booking.start_time},${booking.end_time},"${booking.class_name}","${booking.subject || ""}",${booking.student_count},${booking.status},"${(booking.notes || "").replace(/"/g, '""')}"\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "my_bookings.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportBookingsAsPDF = (bookingsToExport) => {
    const pdf = new jsPDF()
    let yPos = 10
    const margin = 10
    const lineHeight = 7

    pdf.setFontSize(16)
    pdf.text("My Bookings Report", margin, yPos)
    yPos += 10

    pdf.setFontSize(10)
    bookingsToExport.forEach((booking, index) => {
      if (yPos > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage()
        yPos = margin
      }
      pdf.text(`Booking ID: ${booking.id}`, margin, yPos)
      yPos += lineHeight
      pdf.text(`Room: ${getRoomName(booking.room_id)}`, margin, yPos)
      yPos += lineHeight
      pdf.text(`Date: ${booking.date}`, margin, yPos)
      yPos += lineHeight
      pdf.text(`Time: ${booking.start_time} - ${booking.end_time}`, margin, yPos)
      yPos += lineHeight
      pdf.text(`Class: ${booking.class_name}`, margin, yPos)
      yPos += lineHeight
      pdf.text(`Status: ${booking.status}`, margin, yPos)
      yPos += lineHeight
      if (booking.notes) {
        pdf.text(`Notes: ${booking.notes}`, margin, yPos)
        yPos += lineHeight
      }
      yPos += lineHeight * 0.5
      if (index < bookingsToExport.length - 1) {
        pdf.line(margin, yPos, pdf.internal.pageSize.getWidth() - margin, yPos)
        yPos += lineHeight
      }
    })

    pdf.save("my_bookings.pdf")
  }

  const handleBulkExport = (format) => {
    const bookingsToExport = bookings.filter((b) => selectedBookingIds.has(b.id))

    if (bookingsToExport.length > 0) {
      if (format === "CSV") {
        exportBookingsAsCSV(bookingsToExport)
      } else if (format === "PDF") {
        exportBookingsAsPDF(bookingsToExport)
      }
      setSelectedBookingIds(new Set())
    } else {
      alert(`No bookings selected for bulk export as ${format}.`)
    }
  }

  return (
    <div className={`${styles.myBookingsContainer} ${styles[theme]}`}>
      {error && <div className={styles.errorMessage}>{error}</div>}
      {isLoading && <div className={styles.loadingMessage}>Loading bookings...</div>}

      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <label htmlFor="startDate" className={styles.filterLabel}>
            Start Date:
          </label>
          <input
            type="date"
            id="startDate"
            className={styles.filterInput}
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="endDate" className={styles.filterLabel}>
            End Date:
          </label>
          <input
            type="date"
            id="endDate"
            className={styles.filterInput}
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="room" className={styles.filterLabel}>
            Room:
          </label>
          <select
            id="room"
            className={styles.filterSelect}
            value={filterRoomId}
            onChange={(e) => setFilterRoomId(e.target.value)}
          >
            <option value="all">All Rooms</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="status" className={styles.filterLabel}>
            Status:
          </label>
          <select
            id="status"
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      <div className={styles.quickToggles}>
        <button
          className={styles.toggleButton}
          onClick={() => {
            setFilterStartDate(today)
            setFilterEndDate(today)
            setFilterRoomId("all")
            setFilterStatus("all")
          }}
        >
          Today
        </button>
        <button
          className={styles.toggleButton}
          onClick={() => {
            const now = new Date()
            const dayOfWeek = now.getDay()
            const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
            const monday = new Date(now.setDate(diff))
            const sunday = new Date(now.setDate(monday.getDate() + 6))
            setFilterStartDate(monday.toISOString().split("T")[0])
            setFilterEndDate(sunday.toISOString().split("T")[0])
            setFilterRoomId("all")
            setFilterStatus("all")
          }}
        >
          This Week
        </button>
        <button
          className={styles.toggleButton}
          onClick={() => {
            const now = new Date()
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            setFilterStartDate(firstDay.toISOString().split("T")[0])
            setFilterEndDate(lastDay.toISOString().split("T")[0])
            setFilterRoomId("all")
            setFilterStatus("all")
          }}
        >
          This Month
        </button>
      </div>

      <div className={styles.bulkActionsContainer}>
        <button
          className={styles.actionButton}
          onClick={() => handleBulkExport("CSV")}
          disabled={selectedBookingIds.size === 0}
        >
          Export CSV ({selectedBookingIds.size})
        </button>
        <button
          className={styles.actionButton}
          onClick={() => handleBulkExport("PDF")}
          disabled={selectedBookingIds.size === 0}
        >
          Export PDF ({selectedBookingIds.size})
        </button>
      </div>

      <div className={styles.viewToggle}>
        <button
          className={`${styles.toggleButton} ${currentView === "list" ? styles.active : ""}`}
          onClick={() => setCurrentView("list")}
        >
          List View
        </button>
        <button
          className={`${styles.toggleButton} ${currentView === "calendar" ? styles.active : ""}`}
          onClick={() => setCurrentView("calendar")}
        >
          Calendar View
        </button>
      </div>

      {currentView === "calendar" ? (
        <InstructorCalendar theme={theme} bookings={filteredBookings} />
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.bookingsTable}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={
                      selectedBookingIds.size === filteredBookings.filter((b) => b.isCancellable).length &&
                      filteredBookings.filter((b) => b.isCancellable).length > 0
                    }
                    disabled={filteredBookings.filter((b) => b.isCancellable).length === 0}
                  />
                </th>
                <th>Room</th>
                <th>Date</th>
                <th>Time</th>
                <th>Class</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className={booking.isCancelled ? styles.cancelledRow : ""}
                  onClick={() => openSidePanel(booking)}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedBookingIds.has(booking.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleBookingSelection(booking.id)
                      }}
                      disabled={!booking.isCancellable}
                    />
                  </td>
                  <td>{getRoomName(booking.room_id)}</td>
                  <td>{booking.date}</td>
                  <td>{`${booking.start_time} - ${booking.end_time}`}</td>
                  <td>{booking.class_name}</td>
                  <td>
                    <span className={`${styles.status} ${styles[booking.status]}`}>{booking.status}</span>
                  </td>
                  <td className={styles.actions}>
                    <button
                      className={styles.actionButton}
                      disabled={booking.isPast || booking.isCancelled}
                      onClick={(e) => {
                        e.stopPropagation()
                        openSidePanel(booking, true)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.cancelButton}`}
                      disabled={booking.isPast || booking.isCancelled}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCancelBooking(booking.id)
                      }}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isPanelOpen && selectedBooking && (
        <div className={`${styles.sidePanel} ${styles[theme]}`}>
          <div className={styles.sidePanelHeader}>
            <h3>{isEditing ? "Edit Booking" : "Booking Details"}</h3>
            <button onClick={closeSidePanel} className={styles.closeButton}>
              X
            </button>
          </div>
          {isEditing ? (
            <div className={styles.sidePanelContent}>
              <EditBookingForm
                booking={selectedBooking}
                onSave={handleSaveBooking}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <>
              <div className={styles.sidePanelContent}>
                <p>
                  <strong>Room:</strong> {getRoomName(selectedBooking.room_id)}
                </p>
                <p>
                  <strong>Date:</strong> {selectedBooking.date}
                </p>
                <p>
                  <strong>Time:</strong> {selectedBooking.start_time} - {selectedBooking.end_time}
                </p>
                <p>
                  <strong>Class:</strong> {selectedBooking.class_name}
                </p>
                <p>
                  <strong>Status:</strong> {selectedBooking.status}
                </p>
                <p>
                  <strong>Subject:</strong> {selectedBooking.subject || "N/A"}
                </p>
                <p>
                  <strong>Student Count:</strong> {selectedBooking.student_count}
                </p>
                <p>
                  <strong>Notes:</strong> {selectedBooking.notes || "N/A"}
                </p>
              </div>
              <div className={styles.sidePanelActions}>
                <button
                  className={styles.actionButton}
                  disabled={selectedBooking.isPast || selectedBooking.isCancelled}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
                <button
                  className={`${styles.actionButton} ${styles.cancelButton}`}
                  disabled={selectedBooking.isPast || selectedBooking.isCancelled}
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default MyBookings
