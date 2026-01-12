import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import toast from 'react-hot-toast';
import styles from './Register.module.css';

const initialFormData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'instructor', // Default role
};

export default function Register({ loginMode = false }) {
  const [isLoginMode, setIsLoginMode] = useState(loginMode);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const targetDashboard = user.role === 'admin' ? '/dashboard' : '/instructor/dashboard';
      navigate(targetDashboard, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    setIsLoginMode(loginMode);
    setFormData(initialFormData); // Reset form when switching modes
  }, [loginMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const toastId = toast.loading(isLoginMode ? 'Signing in...' : 'Creating account...');

    try {
      let loggedInUser;
      if (isLoginMode) {
        loggedInUser = await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        loggedInUser = await register(formData.fullName, formData.email, formData.password, formData.role);
      }
      
      toast.success(isLoginMode ? 'Signed in successfully!' : 'Account created successfully!', { id: toastId });

      const targetDashboard = loggedInUser.role === 'admin' ? '/dashboard' : '/instructor/dashboard';
      navigate(from || targetDashboard, { replace: true });

    } catch (error) {
      toast.error(error.message || 'An error occurred.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form className={styles.registerForm} onSubmit={handleSubmit}>
      <h2>Welcome Back</h2>
      <div className={styles.inputGroup}>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required disabled={loading} />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required disabled={loading} />
      </div>
      <button type="submit" className={styles.registerBtn} disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
      <p className={styles.loginLink}>
        Don't have an account? <Link to="/signup" className={styles.linkBtn}>Create account</Link>
      </p>
    </form>
  );

  const renderSignupForm = () => (
    <form className={styles.registerForm} onSubmit={handleSubmit}>
      <h2>Create Account</h2>
      <div className={styles.inputGroup}>
        <label htmlFor="fullName">Full Name</label>
        <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required disabled={loading} />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required disabled={loading} />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required disabled={loading} />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required disabled={loading} />
      </div>
      <div className={styles.inputGroup}>
        <label>Role</label>
        <div className={styles.roleSelector}>
          <label>
            <input type="radio" name="role" value="instructor" checked={formData.role === 'instructor'} onChange={handleChange} disabled={loading} />
            Instructor
          </label>
          <label>
            <input type="radio" name="role" value="admin" checked={formData.role === 'admin'} onChange={handleChange} disabled={loading} />
            Admin
          </label>
        </div>
      </div>
      <button type="submit" className={styles.registerBtn} disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
      <p className={styles.loginLink}>
        Already have an account? <Link to="/login" className={styles.linkBtn}>Log In</Link>
      </p>
    </form>
  );

  return (
    <div className={styles.registerContainer}>
      {isLoginMode ? renderLoginForm() : renderSignupForm()}
    </div>
  );
}
