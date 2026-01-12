import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './Home.jsx';
import Dashboard from './Dashboard.jsx';
import Register from './Register.jsx';
import Unauthorized from './Unauthorized.jsx';

import Instructor from './Instructor.jsx';
import InstructorDashboard from './InstructorDashboard.jsx';
import BookARoom from './BookARoom.jsx';
import MyBookings from './MyBookings.jsx';
import InstructorProfile from './InstructorProfile.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import Bookings from './Bookings.jsx';
import Rooms from './Rooms.jsx';
import AdminCalendar from './AdminCalendar.jsx';
import Settings from './Settings.jsx';
import DashboardRedirect from './DashboardRedirect.jsx';
import UserManagement from './UserManagement.jsx';
import ReportsAnalytics from './ReportsAnalytics.jsx';

function App() {

  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Register loginMode={true}/>} />
          <Route path="/signup" element={<Register loginMode={false} />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Dynamic Dashboard Redirect */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'instructor']}>
              <DashboardRedirect />
            </ProtectedRoute>
          } />

          {/* Admin Protected Route */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Instructor Protected Routes */}
          <Route path="/instructor" element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <Instructor />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="book" element={<BookARoom />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="profile" element={<InstructorProfile />} />
          </Route>
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App;
