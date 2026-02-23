import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import './Pages.css'

export default function Settings(){
  const { user, changePassword, sessionYear, changeSessionYear } = useStore()
  const [current, setCurrent] = useState('')
  const [npass, setNpass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [changing, setChanging] = useState(false)
  const [newYear, setNewYear] = useState(sessionYear || String(new Date().getFullYear()))

  async function doChangePwd(e){
    e.preventDefault()
    setErr(null); setMsg(null)
    if(npass !== confirm){ setErr('New password and confirm do not match'); return }
    try{
      setChanging(true)
      await changePassword(current, npass)
      setMsg('Password changed successfully')
      setCurrent(''); setNpass(''); setConfirm('')
    }catch(er){ setErr(er?.message || 'Failed to change password') }
    finally{ setChanging(false) }
  }

  function doChangeYear(){
    if(!newYear) return
    if(newYear === sessionYear) return setMsg('Already on session ' + newYear)
    if(!window.confirm(`Switch session to ${newYear}? This will load data for ${newYear} (or create new empty session). Current session data will be preserved.`)) return
    try{
      changeSessionYear(newYear)
      setMsg(`Session switched to ${newYear}`)
      setErr(null)
    }catch(er){ setErr(er?.message || 'Failed to switch session') }
  }

  return (
    <div className="page-container">
      <h2>Settings</h2>

      <div className="settings-grid">
        <section className="settings-card">
          <h3>Change Password</h3>
          <p className="settings-meta">User: <strong>{user?.username || '—'}</strong></p>
          <form onSubmit={doChangePwd}>
            <div className="settings-field"><input placeholder="Current password" type="password" value={current} onChange={e=>setCurrent(e.target.value)} required /></div>
            <div className="settings-field"><input placeholder="New password" type="password" value={npass} onChange={e=>setNpass(e.target.value)} required /></div>
            <div className="settings-field"><input placeholder="Confirm new password" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required /></div>
            <div className="settings-actions">
              <button type="submit" className="primary" disabled={changing}>{changing ? 'Changing...' : 'Change Password'}</button>
            </div>
          </form>
        </section>

        <section className="settings-card">
          <h3>Session Year</h3>
          <p className="settings-meta">Active session: <strong>{sessionYear}</strong></p>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input className="" value={newYear} onChange={e=>setNewYear(e.target.value)} style={{padding:10,borderRadius:8,border:'1px solid var(--border-color)',flex:'0 0 160px'}} />
            <button onClick={doChangeYear} className="primary">Switch</button>
          </div>
          <p className="settings-note">When you switch session, current session data is saved and the selected session data is loaded. If no data exists for the new session, empty tables will be created.</p>
        </section>
      </div>

      {(msg || err) && (
        <div className={`settings-alert ${msg? 'success':''} ${err? 'error':''}`}>
          {msg && <div>{msg}</div>}
          {err && <div>{err}</div>}
        </div>
      )}
    </div>
  )
}
