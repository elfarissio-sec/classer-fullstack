import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import InstructorSidebar from "./InstructorSidebar";
import "./Dashboard.css";

const Instructor = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className={`dashboard ${theme}`}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <div className="main">
        <InstructorSidebar theme={theme} />
        <div className="content">
          <Outlet context={{ theme }}/>
        </div>
      </div>
    </div>
  );
};

export default Instructor;
