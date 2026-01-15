"use client";

import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import styles from "./BookARoom.module.css";
import RoomList from "./Rooms";
import TimelineView from "./TimelineView";
import { api } from "./api/config";

const generateTimeSlots = () => {
  const slots = [];
  for (let i = 8; i <= 18; i++) {
    slots.push(`${i.toString().padStart(2, "0")}:00`);
    if (i < 18) {
      slots.push(`${i.toString().padStart(2, "0")}:30`);
    }
  }
  return slots;
};

const BookARoom = ({ theme: propTheme }) => {
  const context = useOutletContext();
  const theme = propTheme || context?.theme;

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    room: "",
    roomId: null,
    date: "",
    startTime: "",
    endTime: "",
    className: "",
    subject: "",
    studentCount: "",
    notes: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState("list");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roomsData, bookingsData] = await Promise.all([
          api.getRooms(),
          api.getBookings(),
        ]);
        setRooms(roomsData);
        setBookings(bookingsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const todayDate = getTodayDate();

  const timeSlots = useMemo(() => {
    const allSlots = generateTimeSlots();

    if (!formData.roomId || !formData.date) {
      return allSlots.map((time) => ({ time, isOccupied: false }));
    }

    const todaysBookings = bookings.filter(
      (booking) =>
        booking.room_id === formData.roomId &&
        booking.date === formData.date &&
        booking.status !== "cancelled"
    );

    const currentTime = new Date().getHours();
    // Mark past time slots as occupied if booking is for today
    let past_slots = new Set();
    if (formData.date === getTodayDate()) {
      allSlots.forEach((slot) => {
        const slotTime = new Date(`${formData.date}T${slot}`);
        if (slotTime.getHours() < currentTime) {
          past_slots.add(slot);
        }
      });
    }

    const occupiedSlots = new Set();
    todaysBookings.forEach((booking) => {
      const start = new Date(`${formData.date}T${booking.start_time}`);
      const end = new Date(`${formData.date}T${booking.end_time}`);

      // If booking is for today, mark past time slots as occupied;

      allSlots.forEach((slot) => {
        const slotTime = new Date(`${formData.date}T${slot}`);
        if (slotTime >= start && slotTime < end) {
          occupiedSlots.add(slot);
        }
      });
    });

    return allSlots.map((time) => ({
      time,
      isOccupied: occupiedSlots.has(time),
      isPast: past_slots.has(time),
    }));
  }, [formData.roomId, formData.date, bookings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const selectedRoom = rooms.find((r) => r.name === value);
    if (name === "room") {
      setFormData({
        ...formData,
        room: value,
        roomId: selectedRoom?.id || null,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (
      formData.studentCount >
      rooms.find((r) => r.id === formData.roomId)?.capacity
    ) {
      alert("Please enter a valid number for Student Count.");
      return;
    }
    try {
      setSubmitting(true);
      await api.createBooking({
        roomId: formData.roomId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        className: formData.className,
        subject: formData.subject,
        studentCount: Number.parseInt(formData.studentCount) || 0,
        notes: formData.notes,
      });

      alert("Booking request submitted successfully!");
      setIsModalOpen(false);

      // Refresh bookings
      const bookingsData = await api.getBookings();
      setBookings(bookingsData);

      // Reset form
      setFormData({
        room: "",
        roomId: null,
        date: "",
        startTime: "",
        endTime: "",
        className: "",
        subject: "",
        studentCount: "",
        notes: "",
      });
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSlotClick = (room, startTime, endTime) => {
    setFormData((prev) => ({
      ...prev,
      room: room.name,
      roomId: room.id,
      startTime,
      endTime,
    }));
  };

  const startTimeIndex = formData.startTime
    ? timeSlots.findIndex((slot) => slot.time === formData.startTime)
    : -1;

  let nextOccupiedTime = null;
  if (startTimeIndex > -1) {
    const nextOccupiedSlot = timeSlots
      .slice(startTimeIndex + 1)
      .find((slot) => slot.isOccupied);
    if (nextOccupiedSlot) {
      nextOccupiedTime = nextOccupiedSlot.time;
    }
  }

  if (loading) {
    return (
      <div className={`${styles.bookARoomContainer} ${styles[theme]}`}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.bookARoomContainer} ${styles[theme]}`}>
        <p className={styles.error}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.bookARoomContainer} ${styles[theme]}`}>
      <div>
        <h2>Book a Room</h2>
        <form onSubmit={handleSubmit} className={styles.bookingForm}>
          <div className={styles.formGroup}>
            <label htmlFor="room">Room</label>
            <select
              id="room"
              name="room"
              value={formData.room}
              onChange={handleChange}
              required
            >
              <option value="">Select a Room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.name}>
                  {room.name} - Capacity: {room.capacity}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={todayDate}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="startTime">Start Time</label>
            <select
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            >
              <option value="">Select a Start Time</option>
              {timeSlots.map(({ time, isOccupied, isPast }) => (
                <option key={time} value={time} disabled={isOccupied || isPast}>
                  {time} {isOccupied ? "(Booked)" : isPast ? "(Past)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="endTime">End Time</label>
            <select
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            >
              <option value="">Select an End Time</option>
              {timeSlots.map(({ time, isOccupied }, index) => {
                const isBeforeOrAtStart =
                  startTimeIndex > -1 && index <= startTimeIndex;
                const isNonContinuous =
                  nextOccupiedTime && time > nextOccupiedTime;
                const isItselfOccupied =
                  isOccupied && time !== nextOccupiedTime;
                const isDisabled =
                  isBeforeOrAtStart || isNonContinuous || isItselfOccupied;

                return (
                  <option key={time} value={time} disabled={isDisabled}>
                    {time} {isOccupied ? "(Booked)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="className">Class Name</label>
            <input
              type="text"
              id="className"
              name="className"
              value={formData.className}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="studentCount">Student Count</label>
            <input
              type="number"
              id="studentCount"
              name="studentCount"
              value={formData.studentCount}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>
          <button type="submit" className={styles.submitButton}>
            Book Now
          </button>
        </form>
      </div>
      <div className={styles.roomsOverview}>
        <div className={styles.viewToggle}>
          <button
            onClick={() => setView("list")}
            className={view === "list" ? styles.activeView : ""}
          >
            List View
          </button>
          <button
            onClick={() => setView("timeline")}
            className={view === "timeline" ? styles.activeView : ""}
          >
            Timeline View
          </button>
        </div>
        {view === "list" ? (
          <RoomList
            theme={theme}
            selection={formData}
            rooms={rooms}
            bookings={bookings}
          />
        ) : (
          <TimelineView
            theme={theme}
            selection={formData}
            onSlotClick={handleSlotClick}
            rooms={rooms}
            bookings={bookings}
          />
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>Confirm Your Booking</h3>
            <p>
              <strong>Room:</strong> {formData.room}
            </p>
            <p>
              <strong>Date:</strong> {formData.date}
            </p>
            <p>
              <strong>Time:</strong> {formData.startTime} - {formData.endTime}
            </p>
            <p>
              <strong>Class:</strong> {formData.className}
            </p>
            {formData.subject && (
              <p>
                <strong>Subject:</strong> {formData.subject}
              </p>
            )}
            <div className={styles.modalActions}>
              <button
                onClick={handleConfirmBooking}
                className={styles.confirmButton}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Confirm"}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookARoom;
