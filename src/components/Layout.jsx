import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import './Layout.css';

/**
 * Main layout component with sidebar navigation and content area
 */
export default function Layout() {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-root">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo">
          <img
            src="/School logo 1 (1).png"
            alt="AL-HAFIZ PUBLIC SCHOOL CHAWINDA"
            className="logo-image"
          />
        </div>

        <nav className="nav-menu">
          <Link to="/">Dashboard</Link>
          <Link to="/students">Students</Link>
          <Link to="/staff">Staff</Link>
          <Link to="/finance">Finance</Link>
          <Link to="/settings">Settings</Link>
        </nav>

        {/* User Section */}
        <div className="user-section">
          <div className="username">{user?.username}</div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-area">
        <header className="topbar">
          <h2>School Management</h2>
          <div className="actions">
            <Link to="/">Dashboard</Link>
          </div>
        </header>

        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
