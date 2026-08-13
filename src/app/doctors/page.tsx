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
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);

  // New Doctor Form Data
  const [newDocData, setNewDocData] = useState({
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
    } catch (err) {
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
  }, [token, search, specialization, hospital, startDate, endDate]);

  useEffect(() => {
    if (token && selectedDoctor) {
      fetchDoctorPatients(selectedDoctor._id);
    }
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
        <div className="split-view-container">
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
                            <td>
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
                            <td>{doc.hospital}</td>
                            <td className="text-muted" style={{ fontSize: '0.8rem' }}>
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
      </main>

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.025em;
        }

        .page-header p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-top: 0.25rem;
        }

        /* Filters Panel */
        .filter-panel {
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
        }

        .filter-row {
          display: flex;
          gap: 1rem;
        }

        .filter-row.second-row {
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-color);
          padding-top: 0.875rem;
        }

        .filter-input-group {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-group {
          flex: 2;
        }

        .filter-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
        }

        .filter-control {
          width: 100%;
          padding: 0.625rem 0.875rem;
          padding-left: 2.5rem;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          outline: none;
          height: 38px;
        }

        select.filter-control {
          padding-left: 0.875rem;
          cursor: pointer;
        }

        .filter-control:focus {
          border-color: var(--accent-primary);
        }

        .date-filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.825rem;
          color: var(--text-secondary);
        }

        .date-icon {
          color: var(--text-muted);
        }

        .date-control {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 0.35rem 0.5rem;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          outline: none;
        }

        .clear-filters-btn {
          font-size: 0.825rem;
          color: var(--accent-primary);
          font-weight: 600;
        }

        .clear-filters-btn:hover {
          color: var(--text-primary);
          text-decoration: underline;
        }

        /* Split layout panels */
        .list-panel {
          min-width: 0;
        }

        .detail-panel {
          position: sticky;
          top: 1.5rem;
          height: fit-content;
        }

        /* Doctor custom rows */
        .doctor-row {
          transition: background-color var(--transition-fast);
        }

        .doctor-row:hover td {
          background-color: rgba(255, 255, 255, 0.03) !important;
        }

        .active-row td {
          background-color: rgba(99, 102, 241, 0.08) !important;
          border-left: 2px solid var(--accent-primary);
        }

        .doctor-info-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .active-row .avatar {
          background-color: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .doc-name {
          font-weight: 600;
          color: #fff;
        }

        .doc-spec {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .no-data-cell {
          text-align: center;
          padding: 3rem !important;
          color: var(--text-muted);
        }

        /* Detail Panel Card */
        .detail-card {
          padding: 2rem 1.5rem;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .detail-header {
          text-align: center;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .close-panel-btn {
          position: absolute;
          top: 0;
          right: 0;
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }

        .close-panel-btn:hover {
          color: #fff;
        }

        .doc-avatar-large {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: var(--radius-md);
          background-color: rgba(99, 102, 241, 0.1);
          color: var(--accent-primary);
          border: 1px solid rgba(99, 102, 241, 0.2);
          margin-bottom: 0.5rem;
        }

        .detail-header h2 {
          font-size: 1.35rem;
          color: #fff;
          font-weight: 700;
          letter-spacing: -0.015em;
        }

        .detail-contact-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1.25rem;
          background-color: rgba(0, 0, 0, 0.15);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .text-email {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        /* Patients list section */
        .patients-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .patients-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .patients-section-header h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
        }

        .add-patient-toggle {
          padding: 0.35rem 0.625rem;
          font-size: 0.75rem;
        }

        .assigned-patients-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 250px;
          overflow-y: auto;
        }

        .patient-mini-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
        }

        .patient-mini-info {
          display: flex;
          flex-direction: column;
        }

        .pat-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #fff;
        }

        .pat-cond {
          font-size: 0.725rem;
          color: var(--text-muted);
        }

        .pat-delete-btn {
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }

        .pat-delete-btn:hover {
          color: var(--accent-danger);
        }

        .no-patients-fallback {
          text-align: center;
          padding: 1.5rem;
          color: var(--text-muted);
          font-size: 0.8rem;
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-sm);
        }

        /* Form under details */
        .add-patient-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1.25rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background-color: var(--bg-secondary);
        }

        .form-row {
          display: flex;
          gap: 0.5rem;
        }

        .form-input-sm {
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
          height: 34px;
        }

        .btn-sm {
          padding: 0.5rem;
          font-size: 0.8rem;
        }

        /* Placeholder Detail Card */
        .placeholder-detail-card {
          text-align: center;
          padding: 4rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: var(--text-muted);
          height: 100%;
          border: 1px dashed var(--border-color);
        }

        .placeholder-icon {
          color: var(--border-color);
          margin-bottom: 0.5rem;
        }

        .placeholder-detail-card h3 {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .placeholder-detail-card p {
          font-size: 0.85rem;
          max-width: 250px;
        }

        /* Spinner sizing */
        .loading-container-sm {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 0;
        }

        .sm-spinner {
          width: 24px;
          height: 24px;
        }

        .btn-icon {
          padding: 0.5rem;
          width: 34px;
          height: 34px;
        }
      `}</style>
    </div>
  );
}
