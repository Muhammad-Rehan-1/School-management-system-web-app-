import React, { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import './Pages.css'

export default function Staff(){
  const { staff, deleteStaff } = useStore()
  const [query, setQuery] = useState('')

  const displayed = useMemo(() => {
    const base = staff
    const q = (query || '').trim().toLowerCase()
    if(!q) return base
    const matches = s => (s.name||'').toLowerCase().includes(q) || (s.contact||'').toLowerCase().includes(q) || (s.email||'').toLowerCase().includes(q) || (s.father||'').toLowerCase().includes(q)
    return base.filter(matches)
  }, [staff, query])

  return (
    <div className="page-container">
      <h2>Staff</h2>

      <div className="search-row center">
        <div className="search-box">
          <span className="search-icon" aria-hidden>🔍</span>
          <input className="search-input" placeholder="Search by name, contact or email..." value={query} onChange={(e)=>setQuery(e.target.value)} />
          {query && <button type="button" className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">✕</button>}
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Father</th>
            <th>Role</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Address</th>
            <th>DOB</th>
            <th>Enrollment</th>
            <th>CNIC</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.father || '-'}</td>
              <td>{s.role || '-'}</td>
              <td>{s.contact || '-'}</td>
              <td>{s.email || '-'}</td>
              <td>{s.address || '-'}</td>
              <td>{s.dob ? new Date(s.dob).toLocaleDateString() : '-'}</td>
              <td>{s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString() : '-'}</td>
              <td>{s.cnicUrl ? <a href={s.cnicUrl} target="_blank" rel="noreferrer">View</a> : '-'}</td>
              <td><button onClick={() => { if(window.confirm('Delete this staff member?')) deleteStaff(s.id) }}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 
