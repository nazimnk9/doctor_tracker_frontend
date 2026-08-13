'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import {
  Search,
  Plus,
  Calendar,
  Phone,
  Mail,
  Building,
  User,
  Trash2,
  X,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Edit2,
} from 'lucide-react';

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
}

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  phone: string;
  email?: string;
  dateAdded: string;
}

export default function DoctorsPage() {
  const { token, loading: authLoading } = useAuth();
  
  // Doctor listing states
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search states
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospital, setHospital] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterOptions, setFilterOptions] = useState<{ specializations: string[]; hospitals: string[] }>({
    specializations: [],
    hospitals: [],
  });

  // Selected doctor detailed view states
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorPatients, setDoctorPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Modal states
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showEditDocModal, setShowEditDocModal] = useState(false);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);

  // New Doctor Form Data
  const [newDocData, setNewDocData] = useState({
    name: '',
    specialization: '',
    hospital: '',
    phone: '',
    email: '',
  });

  // Edit Doctor Form Data
  const [editDocData, setEditDocData] = useState({
    name: '',
    specialization: '',
    hospital: '',
    phone: '',
    email: '',
  });

  // New Patient Form Data
  const [newPatientData, setNewPatientData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    condition: '',
    phone: '',
    email: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Fetch doctors list
  const fetchDoctors = async (currentPage = page) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '6',
      });

      if (search) params.append('search', search);
      if (specialization) params.append('specialization', specialization);
      if (hospital) params.append('hospital', hospital);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`${API_URL}/doctors?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setDoctors(data.doctors);
        setTotalPages(data.pages);
        setTotalDoctors(data.total);
        setFilterOptions({
          specializations: data.filters.specializations || [],
          hospitals: data.filters.hospitals || [],
        });
      } else {
        setError('Failed to fetch doctors list');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch patients for a specific doctor
  const fetchDoctorPatients = async (doctorId: string) => {
    if (!token) return;
    setLoadingPatients(true);
    try {
      const res = await fetch(`${API_URL}/doctors/${doctorId}/patients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDoctorPatients(data.patients);
      }
    } catch (err) {
      console.error('Failed to load doctor patients:', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDoctors(1);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, search, specialization, hospital, startDate, endDate]);

  useEffect(() => {
    if (token && selectedDoctor) {
      fetchDoctorPatients(selectedDoctor._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctor, token]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchDoctors(newPage);
    }
  };

  // Create new Doctor handler
  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newDocData),
      });

      if (res.ok) {
        setShowAddDocModal(false);
        setNewDocData({ name: '', specialization: '', hospital: '', phone: '', email: '' });
        fetchDoctors(page);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to create doctor');
      }
    } catch {
      alert('Error connecting to the server');
    }
  };

  // Open edit modal and populate data
  const handleEditDoctorClick = (doctor: Doctor) => {
    setEditDocData({
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      phone: doctor.phone,
      email: doctor.email,
    });
    setShowEditDocModal(true);
  };

  // Update Doctor handler
  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedDoctor) return;
    try {
      const res = await fetch(`${API_URL}/doctors/${selectedDoctor._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editDocData),
      });

      if (res.ok) {
        const updatedDoctor = await res.json();
        setShowEditDocModal(false);
        setSelectedDoctor(updatedDoctor);
        fetchDoctors(page);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to update doctor');
      }
    } catch {
      alert('Error connecting to the server');
    }
  };

  // Delete Doctor handler
  const handleDeleteDoctor = async (doctorId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to permanently delete this doctor and all their assigned patients?')) return;

    try {
      const res = await fetch(`${API_URL}/doctors/${doctorId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setSelectedDoctor(null);
        fetchDoctors(page);
      } else {
        alert('Failed to delete doctor');
      }
    } catch {
      alert('Error connecting to the server');
    }
  };

  // Create patient under selected doctor handler
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedDoctor) return;
    try {
      const payload = {
        ...newPatientData,
        age: parseInt(newPatientData.age),
      };

      const res = await fetch(`${API_URL}/doctors/${selectedDoctor._id}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddPatientForm(false);
        setNewPatientData({ name: '', age: '', gender: 'Male', condition: '', phone: '', email: '' });
        fetchDoctorPatients(selectedDoctor._id);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to add patient');
      }
    } catch {
      alert('Error connecting to the server');
    }
  };

  // Delete patient from doctor list handler
  const handleDeletePatient = async (patientId: string) => {
    if (!token || !selectedDoctor) return;
    if (!confirm('Are you sure you want to delete this patient record?')) return;

    try {
      const res = await fetch(`${API_URL}/doctors/${selectedDoctor._id}/patients/${patientId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchDoctorPatients(selectedDoctor._id);
      } else {
        alert('Failed to remove patient');
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
            <h1>Doctor Management</h1>
            <p>Manage list of physicians, search, filter, and review associated patient list.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddDocModal(true)}>
            <Plus size={18} />
            <span>Add Doctor</span>
          </button>
        </div>

        {/* Filters Panel */}
        <div className="glass-card filter-panel">
          <div className="filter-row">
            <div className="filter-input-group search-group">
              <Search className="filter-icon" size={18} />
              <input
                type="text"
                placeholder="Search by name, spec, hospital..."
                className="filter-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-input-group">
              <select
                className="filter-control"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              >
                <option value="">All Specializations</option>
                {filterOptions.specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-input-group">
              <select
                className="filter-control"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
              >
                <option value="">All Hospitals</option>
                {filterOptions.hospitals.map((hosp) => (
                  <option key={hosp} value={hosp}>
                    {hosp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-row second-row">
            <div className="date-filter-group">
              <Calendar size={16} className="date-icon" />
              <span>Added between:</span>
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
            {(search || specialization || hospital || startDate || endDate) && (
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSearch('');
                  setSpecialization('');
                  setHospital('');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Main Grid Split View */}
        <div className={`split-view-container ${selectedDoctor ? 'has-selected-doctor' : ''}`}>
          {/* Left Panel: Doctors Table */}
          <div className="list-panel">
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
              <>
                <div className="table-container" style={{ margin: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Doctor Info</th>
                        <th>Hospital</th>
                        <th>Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.length > 0 ? (
                        doctors.map((doc) => (
                          <tr
                            key={doc._id}
                            onClick={() => setSelectedDoctor(doc)}
                            className={`doctor-row ${selectedDoctor?._id === doc._id ? 'active-row' : ''}`}
                            style={{ cursor: 'pointer' }}
                          >
                            <td data-label="Doctor Info">
                              <div className="doctor-info-cell">
                                <div className="avatar">
                                  <Stethoscope size={18} />
                                </div>
                                <div>
                                  <div className="doc-name">{doc.name}</div>
                                  <div className="doc-spec">{doc.specialization}</div>
                                </div>
                              </div>
                            </td>
                            <td data-label="Hospital">{doc.hospital}</td>
                            <td data-label="Registered" className="text-muted" style={{ fontSize: '0.8rem' }}>
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="no-data-cell">
                            No doctors matched your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <span className="pagination-count">
                      Page {page} of {totalPages} ({totalDoctors} doctors total)
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
              </>
            )}
          </div>

          {/* Right Panel: Selected Doctor Details */}
          <div className="detail-panel">
            {selectedDoctor ? (
              <div className="glass-card detail-card">
                <div className="detail-header">
                  <div className="doc-avatar-large">
                    <Stethoscope size={32} />
                  </div>
                  <button className="close-panel-btn" onClick={() => setSelectedDoctor(null)}>
                    <X size={18} />
                  </button>
                  <h2>{selectedDoctor.name}</h2>
                  <span className="badge badge-info">{selectedDoctor.specialization}</span>
                  <div className="doc-action-buttons" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEditDoctorClick(selectedDoctor)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteDoctor(selectedDoctor._id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                <div className="detail-contact-list">
                  <div className="contact-item">
                    <Building size={16} />
                    <span>{selectedDoctor.hospital}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={16} />
                    <span>{selectedDoctor.phone}</span>
                  </div>
                  <div className="contact-item">
                    <Mail size={16} />
                    <span className="text-email" title={selectedDoctor.email}>
                      {selectedDoctor.email}
                    </span>
                  </div>
                </div>

                {/* Patient List Section */}
                <div className="patients-section">
                  <div className="patients-section-header">
                    <h3>Assigned Patients</h3>
                    <button
                      className="btn btn-secondary add-patient-toggle"
                      onClick={() => setShowAddPatientForm(!showAddPatientForm)}
                    >
                      {showAddPatientForm ? <X size={14} /> : <UserPlus size={14} />}
                      <span>{showAddPatientForm ? 'Cancel' : 'Add'}</span>
                    </button>
                  </div>

                  {showAddPatientForm ? (
                    <form onSubmit={handleAddPatient} className="add-patient-form">
                      <div className="form-group">
                        <input
                          type="text"
                          placeholder="Patient Name"
                          className="form-input form-input-sm"
                          value={newPatientData.name}
                          onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-row">
                        <input
                          type="number"
                          placeholder="Age"
                          className="form-input form-input-sm"
                          value={newPatientData.age}
                          onChange={(e) => setNewPatientData({ ...newPatientData, age: e.target.value })}
                          required
                        />
                        <select
                          className="form-input form-input-sm"
                          value={newPatientData.gender}
                          onChange={(e) => setNewPatientData({ ...newPatientData, gender: e.target.value })}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <input
                          type="text"
                          placeholder="Medical Condition"
                          className="form-input form-input-sm"
                          value={newPatientData.condition}
                          onChange={(e) => setNewPatientData({ ...newPatientData, condition: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-row">
                        <input
                          type="text"
                          placeholder="Phone"
                          className="form-input form-input-sm"
                          value={newPatientData.phone}
                          onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                          required
                        />
                        <input
                          type="email"
                          placeholder="Email (Optional)"
                          className="form-input form-input-sm"
                          value={newPatientData.email}
                          onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
                        />
                      </div>
                      <button type="submit" className="btn btn-success btn-sm" style={{ width: '100%' }}>
                        Save Patient
                      </button>
                    </form>
                  ) : loadingPatients ? (
                    <div className="loading-container-sm">
                      <div className="spinner sm-spinner"></div>
                    </div>
                  ) : (
                    <div className="assigned-patients-list">
                      {doctorPatients.length > 0 ? (
                        doctorPatients.map((pat) => (
                          <div key={pat._id} className="patient-mini-card">
                            <div className="patient-mini-info">
                              <span className="pat-name">{pat.name}</span>
                              <span className="pat-cond">{pat.condition}</span>
                            </div>
                            <button
                              className="pat-delete-btn"
                              onClick={() => handleDeletePatient(pat._id)}
                              title="Remove patient"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="no-patients-fallback">
                          <span>No patients assigned to this doctor yet.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card placeholder-detail-card">
                <User size={48} className="placeholder-icon" />
                <h3>Select a Doctor</h3>
                <p>Click on any doctor row on the left to view contacts, clinics, and assigned patient charts.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Add Doctor */}
        {showAddDocModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Add New Doctor</h3>
                <button className="close-panel-btn" onClick={() => setShowAddDocModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleAddDoctor}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Doctor Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Dr. Sarah Connor"
                      value={newDocData.name}
                      onChange={(e) => setNewDocData({ ...newDocData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Cardiology"
                      value={newDocData.specialization}
                      onChange={(e) => setNewDocData({ ...newDocData, specialization: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hospital</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. City General Hospital"
                      value={newDocData.hospital}
                      onChange={(e) => setNewDocData({ ...newDocData, hospital: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. +1-555-0192"
                      value={newDocData.phone}
                      onChange={(e) => setNewDocData({ ...newDocData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. doctor@hospital.com"
                      value={newDocData.email}
                      onChange={(e) => setNewDocData({ ...newDocData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddDocModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Doctor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Doctor */}
        {showEditDocModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Edit Doctor Details</h3>
                <button className="close-panel-btn" onClick={() => setShowEditDocModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleUpdateDoctor}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Doctor Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editDocData.name}
                      onChange={(e) => setEditDocData({ ...editDocData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editDocData.specialization}
                      onChange={(e) => setEditDocData({ ...editDocData, specialization: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hospital</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editDocData.hospital}
                      onChange={(e) => setEditDocData({ ...editDocData, hospital: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editDocData.phone}
                      onChange={(e) => setEditDocData({ ...editDocData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={editDocData.email}
                      onChange={(e) => setEditDocData({ ...editDocData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditDocModal(false)}>
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
