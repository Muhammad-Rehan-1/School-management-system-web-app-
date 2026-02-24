import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import EditStudentModal from '../components/EditStudentModal';
import './Pages.css';

const CLASSES = [
  'Play Group',
  'Nursery',
  'Prep',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine'
];

export default function Students() {
  const { students, deleteStudent } = useStore();
  const [selectedClass, setSelectedClass] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);

  /**
   * Filter students by selected class
   */
  const filteredByClass = useMemo(() => {
    if (selectedClass === 'All') return students;
    return students.filter(s => s.classGrade === selectedClass);
  }, [students, selectedClass]);

  /**
   * Further filter by search query
   */
  const displayedStudents = useMemo(() => {
    const query = (searchQuery || '').trim().toLowerCase();
    if (!query) return filteredByClass;

    return filteredByClass.filter(student => {
      const matchesName = (student.name || '').toLowerCase().includes(query);
      const matchesRoll = (student.roll || '').toLowerCase().includes(query);
      const matchesContact = (student.contact || '').toLowerCase().includes(query);
      return matchesName || matchesRoll || matchesContact;
    });
  }, [filteredByClass, searchQuery]);

  const handleDeleteStudent = (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteStudent(studentId);
    }
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : '-';
  };

  return (
    <div className="page-container">
      <h2>Students</h2>

      {/* Class Filter */}
      <div className="classes-row">
        {CLASSES.map(className => (
          <button
            key={className}
            className={className === selectedClass ? 'active' : ''}
            onClick={() => setSelectedClass(className)}
          >
            {className}
          </button>
        ))}
        <button
          className={selectedClass === 'All' ? 'active' : ''}
          onClick={() => setSelectedClass('All')}
        >
          All
        </button>
      </div>

      {/* Search Box */}
      <div className="search-row center">
        <div className="search-box">
          <span className="search-icon" aria-hidden>
            🔍
          </span>
          <input
            className="search-input"
            placeholder="Search by name, roll or contact..."
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

      {/* Students Table */}
      <h3>Students List</h3>
      <div className="table-wrapper">
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
            {displayedStudents.map(student => (
              <tr key={student.id}>
                <td>{student.roll}</td>
                <td>{student.name}</td>
                <td>{student.contact || '-'}</td>
                <td>{student.gender || '-'}</td>
                <td>{student.classGrade || '-'}</td>
                <td>{student.address || '-'}</td>
                <td>{student.admissionFees || 0}</td>
                <td>{student.monthlyFees || 0}</td>
                <td>{formatDate(student.dob)}</td>
                <td>{formatDate(student.enrollmentDate)}</td>
                <td>
                  {student.bformUrl ? (
                    <a href={student.bformUrl} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : typeof student.bForm === 'string' ? (
                    <a href={student.bForm} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <button onClick={() => setEditingStudent(student)}>Edit</button>
                  <button onClick={() => handleDeleteStudent(student.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}
    </div>
  );
}
