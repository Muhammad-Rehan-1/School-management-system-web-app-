import React, { useState, useEffect } from 'react';
import AddStudentModal from '../components/AddStudentModal';
import AddStaffModal from '../components/AddStaffModal';
import { useStore } from '../store/useStore';
import './Pages.css';

/**
 * Dashboard page with overview and quick actions
 */
export default function Dashboard() {
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const { students, staff } = useStore();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddStudent = () => setShowStudentModal(true);
  const handleAddStaff = () => setShowStaffModal(true);

  return (
    <div className="page-container">
      <div className="dashboard-header">
        {/* Action Buttons */}
        <div className="dashboard-actions">
          <button className="primary" onClick={handleAddStudent}>
            Add Student
          </button>
          <button className="secondary" onClick={handleAddStaff}>
            Add Staff
          </button>
        </div>

        {/* Current Date & Time */}
        <div className="datetime-card">
          <div className="datetime-week">
            {currentDateTime.toLocaleDateString(undefined, { weekday: 'long' })}
          </div>
          <div className="datetime-date">
            {currentDateTime.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div className="datetime-time">
            {currentDateTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <h3>Welcome Back, Sir</h3>

      {/* Modals */}
      {showStudentModal && (
        <AddStudentModal onClose={() => setShowStudentModal(false)} />
      )}
      {showStaffModal && (
        <AddStaffModal onClose={() => setShowStaffModal(false)} />
      )}

      {/* Statistics Widgets */}
      <section className="dashboard-widgets">
        <div className="widget">
          {students.length}
          <br />
          <small>Students</small>
        </div>
        <div className="widget">
          {staff.length}
          <br />
          <small>Staff Members</small>
        </div>
      </section>
    </div>
  );
}
