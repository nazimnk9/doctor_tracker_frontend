'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import {
  Search,
  Calendar,
  Phone,
  Mail,
  Trash2,
  Edit2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { validateRequired, validateAge, validatePhone, validateOptionalEmail, validateSelect } from '../../utils/validation';

interface Doctor {
  _id: string;
  name: string;
}

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  phone: string;
  email?: string;
  doctor: {
    _id: string;
    name: string;
    specialization?: string;
    hospital?: string;
  };
  dateAdded: string;
}

export default function PatientsPage() {
  const { token, loading: authLoading } = useAuth();

  // Patient listing states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter states
  const [search, setSearch] = useState('');
  const [condition, setCondition] = useState('');
  const [gender, setGender] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dropdown options loaded from API
  const [filterOptions, setFilterOptions] = useState<{ conditions: string[]; doctors: Doctor[] }>({
    conditions: [],
    doctors: [],
  });

  // Edit Modal states
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    condition: '',
    phone: '',
    email: '',
    doctor: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: string, value: string, validator: (v: string) => string | null) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const err = validator(value);
      setErrors((prevErr) => {
        const next = { ...prevErr };
        if (!err) delete next[field];
        else next[field] = err;
        return next;
      });
    }
  };

  const handleFieldBlur = (field: string, value: string, validator: (v: string) => string | null) => {
    const err = validator(value);
    setErrors((prevErr) => {
      const next = { ...prevErr };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setErrors({});
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Fetch patients list
  const fetchPatients = async (currentPage = page) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '8',
      });

      if (search) params.append('search', search);
      if (condition) params.append('condition', condition);
      if (gender) params.append('gender', gender);
      if (doctorId) params.append('doctorId', doctorId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`${API_URL}/patients?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients);
        setTotalPages(data.pages);
        setTotalPatients(data.total);
        setFilterOptions({
          conditions: data.filters.conditions || [],
          doctors: data.filters.doctors || [],
        });
      } else {
        setError('Failed to load patients catalog');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPatients(1);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, search, condition, gender, doctorId, startDate, endDate]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchPatients(newPage);
    }
  };

  // Open Edit Modal handler
  const openEditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditFormData({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      condition: patient.condition,
      phone: patient.phone,
      email: patient.email || '',
      doctor: patient.doctor?._id || '',
    });
    setErrors({});
    setShowEditModal(true);
  };

  // Save/Update patient details handler
  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedPatient) return;

    const valErrors: Record<string, string> = {};
    const nameErr = validateRequired(editFormData.name);
    const ageErr = validateAge(editFormData.age);
    const genderErr = validateSelect(editFormData.gender);
    const conditionErr = validateRequired(editFormData.condition);
    const phoneErr = validatePhone(editFormData.phone);
    const emailErr = validateOptionalEmail(editFormData.email);
    const docErr = validateSelect(editFormData.doctor);

    if (nameErr) valErrors.name = nameErr;
    if (ageErr) valErrors.age = ageErr;
    if (genderErr) valErrors.gender = genderErr;
    if (conditionErr) valErrors.condition = conditionErr;
    if (phoneErr) valErrors.phone = phoneErr;
    if (emailErr) valErrors.email = emailErr;
    if (docErr) valErrors.doctor = docErr;

    setErrors(valErrors);

    if (Object.keys(valErrors).length > 0) {
      return;
    }

    try {
      const payload = {
        ...editFormData,
        age: parseInt(editFormData.age),
      };

      const res = await fetch(`${API_URL}/patients/${selectedPatient._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        closeEditModal();
        fetchPatients(page);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to update patient profile');
      }
    } catch {
      alert('Error connecting to the server');
    }
  };

  // Delete patient handler
  const handleDeletePatient = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to permanently delete this patient record?')) return;

    try {
      const res = await fetch(`${API_URL}/patients/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchPatients(page);
      } else {
        alert('Failed to delete patient record');
      }
    } catch {
      alert('Error connecting to the server');
    }
  };

  if (authLoading) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Patient Management</h1>
            <p>Comprehensive register of patients, medical conditions, and re-assignment options.</p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="glass-card filter-panel">
          <div className="filter-row">
            <div className="filter-input-group search-group">
              <Search className="filter-icon" size={18} />
              <input
                type="text"
                placeholder="Search by name, condition..."
                className="filter-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-input-group">
              <select
                className="filter-control"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="">All Conditions</option>
                {filterOptions.conditions.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-input-group">
              <select
                className="filter-control"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="filter-input-group">
              <select
                className="filter-control"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                <option value="">All Doctors</option>
                {filterOptions.doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-row second-row">
            <div className="date-filter-group">
              <Calendar size={16} className="date-icon" />
              <span>Admitted between:</span>
              <input
                type="date"
                className="date-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span>and</span>
              <input
                type="date"
                className="date-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            {(search || condition || gender || doctorId || startDate || endDate) && (
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSearch('');
                  setCondition('');
                  setGender('');
                  setDoctorId('');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Patients Table */}
        {error && (
          <div className="glass-card error-card">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="glass-card table-wrapper-card">
            <div className="table-container" style={{ margin: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Age / Gender</th>
                    <th>Condition</th>
                    <th>Contact Info</th>
                    <th>Assigned Doctor</th>
                    <th>Admission Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length > 0 ? (
                    patients.map((pat) => (
                      <tr key={pat._id}>
                        <td data-label="Patient Name" style={{ fontWeight: 600 }}>{pat.name}</td>
                        <td data-label="Age / Gender">
                          {pat.age} yrs / <span className="text-muted">{pat.gender}</span>
                        </td>
                        <td data-label="Condition">
                          <span className="badge badge-info">{pat.condition}</span>
                        </td>
                        <td data-label="Contact Info">
                          <div className="contact-cell">
                            <span className="contact-phone"><Phone size={12} /> {pat.phone}</span>
                            {pat.email && (
                              <span className="contact-email text-muted"><Mail size={12} /> {pat.email}</span>
                            )}
                          </div>
                        </td>
                        <td data-label="Assigned Doctor">
                          <div className="doc-assigned-cell">
                            <span className="doc-name">{pat.doctor?.name || 'Unassigned'}</span>
                            {pat.doctor?.specialization && (
                              <span className="doc-spec text-muted">{pat.doctor.specialization}</span>
                            )}
                          </div>
                        </td>
                        <td data-label="Admission Date" className="text-muted">
                          {new Date(pat.dateAdded).toLocaleDateString()}
                        </td>
                        <td data-label="Actions">
                          <div className="actions-cell">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => openEditModal(pat)}
                              title="Edit patient"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDeletePatient(pat._id)}
                              title="Delete patient"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="no-data-cell">
                        No patients matched your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-count">
                  Page {page} of {totalPages} ({totalPatients} patients total)
                </span>
                <div className="pagination-btn-group">
                  <button
                    className="btn btn-secondary btn-icon"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    className="btn btn-secondary btn-icon"
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: Edit Patient Info */}
        {showEditModal && selectedPatient && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Edit Patient Profile</h3>
                <button className="close-panel-btn" onClick={closeEditModal}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleUpdatePatient} noValidate>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Patient Name</label>
                    <input
                      type="text"
                      className={`form-input ${errors.name ? 'input-error' : ''}`}
                      value={editFormData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value, validateRequired)}
                      onBlur={(e) => handleFieldBlur('name', e.target.value, validateRequired)}
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label className="form-label">Age</label>
                      <input
                        type="number"
                        className={`form-input ${errors.age ? 'input-error' : ''}`}
                        value={editFormData.age}
                        onChange={(e) => handleFieldChange('age', e.target.value, validateAge)}
                        onBlur={(e) => handleFieldBlur('age', e.target.value, validateAge)}
                      />
                      {errors.age && <span className="error-message">{errors.age}</span>}
                    </div>
                    <div className="form-group flex-1">
                      <label className="form-label">Gender</label>
                      <select
                        className={`form-input ${errors.gender ? 'input-error' : ''}`}
                        value={editFormData.gender}
                        onChange={(e) => handleFieldChange('gender', e.target.value, validateSelect)}
                        onBlur={(e) => handleFieldBlur('gender', e.target.value, validateSelect)}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && <span className="error-message">{errors.gender}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Medical Condition</label>
                    <input
                      type="text"
                      className={`form-input ${errors.condition ? 'input-error' : ''}`}
                      value={editFormData.condition}
                      onChange={(e) => handleFieldChange('condition', e.target.value, validateRequired)}
                      onBlur={(e) => handleFieldBlur('condition', e.target.value, validateRequired)}
                    />
                    {errors.condition && <span className="error-message">{errors.condition}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        className={`form-input ${errors.phone ? 'input-error' : ''}`}
                        value={editFormData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value, validatePhone)}
                        onBlur={(e) => handleFieldBlur('phone', e.target.value, validatePhone)}
                      />
                      {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>
                    <div className="form-group flex-1">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className={`form-input ${errors.email ? 'input-error' : ''}`}
                        value={editFormData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value, validateOptionalEmail)}
                        onBlur={(e) => handleFieldBlur('email', e.target.value, validateOptionalEmail)}
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned Doctor</label>
                    <select
                      className={`form-input ${errors.doctor ? 'input-error' : ''}`}
                      value={editFormData.doctor}
                      onChange={(e) => handleFieldChange('doctor', e.target.value, validateSelect)}
                      onBlur={(e) => handleFieldBlur('doctor', e.target.value, validateSelect)}
                    >
                      <option value="">Select Doctor</option>
                      {filterOptions.doctors.map((doc) => (
                        <option key={doc._id} value={doc._id}>
                          {doc.name}
                        </option>
                      ))}
                    </select>
                    {errors.doctor && <span className="error-message">{errors.doctor}</span>}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
