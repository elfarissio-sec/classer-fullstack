import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import DarkLogo from './assets/DarkClasser.png'

export default function Home() {
  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link to="/">
            <img src={DarkLogo} alt="Classer" />
          </Link>
        </div>
        <nav>
          <ul>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </nav>
        <div className={styles.auth}>
          <Link to="/login" className={styles.login}>
            Login
          </Link>
          <Link to="/signup" className={styles.signup}>
            Sign Up
          </Link>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>Welcome to Classer</h1>
            <p>
              Your ultimate solution for managing classrooms, bookings, and
              schedules.
            </p>
            <Link to="/dashboard" className={styles.cta}>
              Get Started
            </Link>
          </div>
        </section>

        <section id="features" className={styles.features}>
          <h2>Features</h2>
          <div className={styles.featureGrid}>
            <div className={styles.feature}>
              <h3>Room Booking</h3>
              <p>Easily book and manage rooms for your classes and events.</p>
            </div>
            <div className={styles.feature}>
              <h3>Calendar Integration</h3>
              <p>Keep track of your schedule with our integrated calendar.</p>
            </div>
            <div className={styles.feature}>
              <h3>User Management</h3>
              <p>Manage users and their roles with our flexible system.</p>
            </div>
          </div>
        </section>

        <section id="about" className={styles.about}>
          <h2>About Us</h2>
          <p>
            We are a team of dedicated professionals who are passionate about
            creating the best classroom management solution for you.
          </p>
        </section>

        <section id="contact" className={styles.contact}>
          <h2>Contact Us</h2>
          <p>
            If you have any questions, please feel free to{" "}
            <a href="mailto:contact@classer.com">email us</a>.
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2025 Classer. All rights reserved.</p>
      </footer>
    </div>
  );
}
