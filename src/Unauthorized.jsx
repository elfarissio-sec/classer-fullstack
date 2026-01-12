import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import styles from './Unauthorized.module.css';

const Unauthorized = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (user?.role === 'admin') {
      navigate('/dashboard');
    } else if (user?.role === 'instructor') {
      navigate('/instructor/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Unauthorized Access</h1>
        <p>You do not have the necessary permissions to view this page.</p>
        <div className={styles.actions}>
          <button onClick={handleGoBack} className={styles.button}>
            Go to Your Dashboard
          </button>
          <button onClick={logout} className={`${styles.button} ${styles.logoutButton}`}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
