import React from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from './Settings.module.css';

const Settings = () => {
  const { theme } = useOutletContext();
  return (
    <div className={`${styles.settings} ${styles[theme]}`}>
      <h2>Settings</h2>
      <form>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <input type="text" id="name" defaultValue="John Doe" />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" defaultValue="john.doe@example.com" />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" defaultValue="********" />
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default Settings;
