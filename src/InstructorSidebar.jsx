import { NavLink } from 'react-router-dom';
import styles from './InstructorSidebar.module.css';
import {
  FaTachometerAlt,
  FaPlusCircle,
  FaBook,
  FaCalendarAlt,
  FaUser,
  FaQuestionCircle,
} from 'react-icons/fa';

const InstructorSidebar = ({ theme }) => {
  const navItems = [
    { name: 'Dashboard', path: '/instructor/dashboard', icon: <FaTachometerAlt /> },
    { name: 'Book a Room', path: '/instructor/book', icon: <FaPlusCircle /> },
    { name: 'My Bookings', path: '/instructor/bookings', icon: <FaBook /> },
    { name: 'Rooms', path: '/instructor/rooms', icon: <FaCalendarAlt /> },
    { name: 'My Profile', path: '/instructor/profile', icon: <FaUser /> },
    // { name: 'Help/Support', path: '/instructor/help', icon: <FaQuestionCircle /> },
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
                className={({ isActive }) => (isActive ? styles.active : '')}
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

export default InstructorSidebar;
