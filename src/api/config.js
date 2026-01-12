// API configuration for frontend
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

// Helper function to make API requests
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("classerToken")

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  // Handle 401 Unauthorized
  if (response.status === 401) {
    localStorage.removeItem("classerToken")
    localStorage.removeItem("classerUser")
    window.location.href = "/login"
    throw new Error("Session expired. Please login again.")
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong")
  }

  return data
}

// API endpoints
export const api = {
  // Auth
  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getProfile: () => apiRequest("/auth/profile"),

  // Users
  getUsers: () => apiRequest("/users"),
  getUser: (id) => apiRequest(`/users/${id}`),
  createUser: (userData) =>
    apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  updateUser: (id, userData) =>
    apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),
  deleteUser: (id) =>
    apiRequest(`/users/${id}`, {
      method: "DELETE",
    }),

  // Rooms
  getRooms: () => apiRequest("/rooms"),
  getRoom: (id) => apiRequest(`/rooms/${id}`),
  createRoom: (roomData) =>
    apiRequest("/rooms", {
      method: "POST",
      body: JSON.stringify(roomData),
    }),
  updateRoom: (id, roomData) =>
    apiRequest(`/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(roomData),
    }),
  deleteRoom: (id) =>
    apiRequest(`/rooms/${id}`, {
      method: "DELETE",
    }),
  checkRoomAvailability: (roomId, date, startTime, endTime, excludeBookingId) =>
    apiRequest(
      `/rooms/${roomId}/availability?date=${date}&startTime=${startTime}&endTime=${endTime}${excludeBookingId ? `&excludeBookingId=${excludeBookingId}` : ""}`,
    ),

  // Bookings
  getBookings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/bookings${queryString ? `?${queryString}` : ""}`)
  },
  getBooking: (id) => apiRequest(`/bookings/${id}`),
  getMyBookings: () => apiRequest("/bookings/my"),
  createBooking: (bookingData) =>
    apiRequest("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    }),
  updateBooking: (id, bookingData) =>
    apiRequest(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(bookingData),
    }),
  updateBookingStatus: (id, status) =>
    apiRequest(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  deleteBooking: (id) =>
    apiRequest(`/bookings/${id}`, {
      method: "DELETE",
    }),

  // Dashboard stats
  getDashboardStats: () => apiRequest("/dashboard/stats"),
  getInstructorStats: () => apiRequest("/dashboard/instructor-stats"),
}
