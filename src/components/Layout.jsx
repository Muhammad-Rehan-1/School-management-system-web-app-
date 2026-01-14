import React from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import './Layout.css'

export default function Layout(){
  const { user, logout } = useStore()
  const nav = useNavigate()
  function doLogout(){ logout(); nav('/login') }

  return (
    <div className="app-root">
      <aside className="sidebar">
        <div className="logo">LOGO</div>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/students">Students</Link>
          <Link to="/staff">Staff</Link>
          <Link to="/finance">Finance</Link>
        </nav>
        <div style={{marginTop:'auto', padding: 16}}>
          <div style={{fontSize:12, color:'#666', marginBottom:8}}>{user?.username}</div>
          <button onClick={doLogout}>Logout</button>
        </div>
      </aside>
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
  )
}
