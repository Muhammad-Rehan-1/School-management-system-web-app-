import React, { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import './Pages.css'

const CLASSES = ['Play Group','Nursery','Prep','One','Two','Three','Four','Five','Six','Seven','Eight','Nine']

export default function Students(){
  const { students, deleteStudent } = useStore()
  const [selected, setSelected] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (selected === 'All') return students
    return students.filter(s => s.classGrade === selected)
  }, [students, selected])

  const displayed = useMemo(() => {
    const base = filtered
    const q = (query || '').trim().toLowerCase()
    if(!q) return base
    const matches = s => (s.name||'').toLowerCase().includes(q) || (s.roll||'').toLowerCase().includes(q) || (s.contact||'').toLowerCase().includes(q)
    return base.filter(matches)
  }, [filtered, query])

  return (
    <div className="page-container">
      <h2>Students</h2>
      <div className="classes-row">
        {CLASSES.map(c => (
          <button key={c} className={c===selected? 'active':''} onClick={() => setSelected(c)}>{c}</button>
        ))}
        <button onClick={() => setSelected('All')}>All</button>
      </div>

      <div className="search-row center">
        <div className="search-box">
          <span className="search-icon" aria-hidden>🔍</span>
          <input className="search-input" placeholder="Search by name, roll or contact..." value={query} onChange={(e)=>setQuery(e.target.value)} />
          {query && <button type="button" className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">✕</button>}
        </div>
      </div>

      <h3>Students List</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Roll</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Gender</th>
            <th>Class</th>
            <th>Address</th>
            <th>Admission</th>
            <th>Monthly</th>
            <th>DOB</th>
            <th>Enrollment</th>
            <th>B-Form</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map(s => (
            <tr key={s.id}>
              <td>{s.roll}</td>
              <td>{s.name}</td>
              <td>{s.contact || '-'}</td>
              <td>{s.gender || '-'}</td>
              <td>{s.classGrade || '-'}</td>
              <td>{s.address || '-'}</td>
              <td>{s.admissionFees || 0}</td>
              <td>{s.monthlyFees || 0}</td>
              <td>{s.dob ? new Date(s.dob).toLocaleDateString() : '-'}</td>
              <td>{s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString() : '-'}</td>
              <td>
                {s.bformUrl ? <a href={s.bformUrl} target="_blank" rel="noreferrer">View</a>
                  : (typeof s.bForm === 'string' ? <a href={s.bForm} target="_blank" rel="noreferrer">View</a> : '-')}
              </td>
              <td>
                <button onClick={() => {
                  if(window.confirm('Delete this student?')){ deleteStudent(s.id) }
                }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
