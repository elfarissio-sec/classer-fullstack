import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import './Dashboard.css';

const Dashboard = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`dashboard ${theme}`}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <div className="main">
        <Sidebar theme={theme} />
        <div className="content">
          <Outlet context={{ theme }} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
