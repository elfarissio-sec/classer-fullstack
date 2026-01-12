import { NavLink } from 'react-router-dom';
import styles from "./Sidebar.module.css";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaDoorOpen,
  FaCalendar,
  FaCog,
  FaUsers,
  FaChartBar,
} from "react-icons/fa";

const Sidebar = ({ theme }) => {
  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt /> },
    { name: "Bookings", path: "/admin/bookings", icon: <FaCalendarAlt /> },
    { name: "Rooms", path: "/admin/rooms", icon: <FaDoorOpen /> },
    { name: "Calendar", path: "/admin/calendar", icon: <FaCalendar /> },
    { name: "User Management", path: "/admin/users", icon: <FaUsers /> },
    { name: "Reports", path: "/admin/reports", icon: <FaChartBar /> },
    { name: "Settings", path: "/admin/settings", icon: <FaCog /> },
  ];

  return (
    <aside className={`${styles.sidebar} ${theme}`}>
      <nav>
        <ul>
          <li className={styles.search}>
            <input type="text" placeholder="Search..." />
          </li>
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? styles.active : "")}
              >
                <div className={styles.option}>
                  {item.icon} <span>{item.name}</span>
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
