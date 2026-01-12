"use client"

import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import styles from "./UserManagement.module.css"
import "./Dashboard.css"
import { api } from "./api/config"

const UserManagement = () => {
  const { theme } = useOutletContext()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const data = await api.getUsers()
        setUsers(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const handleAssignRole = async (userId, newRole) => {
    try {
      await api.updateUser(userId, { role: newRole.toLowerCase() })
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
      alert(`User role changed to ${newRole}.`)
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return

    try {
      await api.deleteUser(userId)
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
      alert("User deleted successfully.")
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className={`${styles.userManagementContainer} ${styles[theme]}`}>
        <p>Loading users...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${styles.userManagementContainer} ${styles[theme]}`}>
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className={`${styles.userManagementContainer} ${styles[theme]}`}>
      <h2 className={styles.sectionTitle}>User Management</h2>

      <table className={styles.userTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select
                  className={styles.roleSelect}
                  value={user.role}
                  onChange={(e) => handleAssignRole(user.id, e.target.value)}
                >
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td className={styles.userActions}>
                <button className={styles.actionButtonSecondary} onClick={() => handleDeleteUser(user.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserManagement
