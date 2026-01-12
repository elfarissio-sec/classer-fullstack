import styles from "./Header.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { FaSignOutAlt } from "react-icons/fa";
import { FaSun, FaMoon } from 'react-icons/fa';
import LightLogo from "./assets/LightClasser.png";
import DarkLogo from "./assets/DarkClasser.png";

const Header = ({ theme, toggleTheme }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={`${styles.header} ${[theme]}`}>
      <div className={styles.logo}>
        <Link to="/">
          <img src={theme == "light" ? DarkLogo : LightLogo} alt="Classer" />
        </Link>
      </div>

      {isAuthenticated && user ? (
        <div className={styles.profile}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userRole}>{user.role}</span>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
          <button className={styles.themeToggle} onClick={toggleTheme}>
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
        </div>
      ) : (
        <div className={styles.loginActions}>
          <Link to="/login" className={styles.loginButton}>
            Sign In
          </Link>
          <Link to="/signup" className={styles.signupButton}>
            Sign Up
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
