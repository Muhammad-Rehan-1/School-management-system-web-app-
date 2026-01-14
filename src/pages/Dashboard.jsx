import React, { useState, useEffect } from 'react'
import AddStudentModal from '../components/AddStudentModal'
import AddStaffModal from '../components/AddStaffModal'
import { useStore } from '../store/useStore'
import './Pages.css'

export default function Dashboard(){
  const [showStudent, setShowStudent] = useState(false)
  const [showStaff, setShowStaff] = useState(false)
  const { students, staff } = useStore()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="page-container">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div className="dashboard-actions">
          <button className="primary" onClick={() => setShowStudent(true)}>Add Student</button>
          <button className="secondary" onClick={() => setShowStaff(true)}>Add Staff</button>
          <br></br>
        </div>
        <div className="datetime-card">
          <div className="datetime-week">{now.toLocaleDateString(undefined,{weekday:'long'})}</div>
          <div className="datetime-date">{now.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})}</div>
          <div className="datetime-time">{now.toLocaleTimeString()}</div>
        </div>
      </div>

      <h3>Welcome Back, Sir</h3>

      {showStudent && <AddStudentModal onClose={() => setShowStudent(false)} />}
      {showStaff && <AddStaffModal onClose={() => setShowStaff(false)} />}

      <section className="dashboard-widgets">
        <div className="widget">{students.length}<br/><small>Students</small></div>
        <div className="widget">{staff.length}<br/><small>Staffs</small></div>
      </section>
    </div>
  )
}
