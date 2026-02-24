import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import EditStaffModal from '../components/EditStaffModal';
import './Pages.css';

export default function Staff() {
  const { staff, deleteStaff } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStaff, setEditingStaff] = useState(null);

  /**
   * Filter staff by search query
   */
  const displayedStaff = useMemo(() => {
    const query = (searchQuery || '').trim().toLowerCase();
    if (!query) return staff;

    return staff.filter(member => {
      const matchesName = (member.name || '').toLowerCase().includes(query);
      const matchesContact = (member.contact || '').toLowerCase().includes(query);
      const matchesEmail = (member.email || '').toLowerCase().includes(query);
      const matchesFather = (member.father || '').toLowerCase().includes(query);
      return matchesName || matchesContact || matchesEmail || matchesFather;
    });
  }, [staff, searchQuery]);

  const handleDeleteStaff = (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      deleteStaff(staffId);
    }
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : '-';
  };

  return (
    <div className="page-container">
      <h2>Staff</h2>

      {/* Search Box */}
      <div className="search-row center">
        <div className="search-box">
          <span className="search-icon" aria-hidden>
            🔍
          </span>
          <input
            className="search-input"
            placeholder="Search by name, contact or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Staff Table */}
      <h3>Staff List</h3>
      <div className="table-wrapper">
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
            {displayedStaff.map(member => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.father || '-'}</td>
                <td>{member.role || '-'}</td>
                <td>{member.contact || '-'}</td>
                <td>{member.email || '-'}</td>
                <td>{member.address || '-'}</td>
                <td>{formatDate(member.dob)}</td>
                <td>{formatDate(member.enrollmentDate)}</td>
                <td>
                  {member.cnicUrl ? (
                    <a href={member.cnicUrl} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <button onClick={() => setEditingStaff(member)}>Edit</button>
                  <button onClick={() => handleDeleteStaff(member.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingStaff && (
        <EditStaffModal
          staff={editingStaff}
          onClose={() => setEditingStaff(null)}
        />
      )}
    </div>
  );
} 
