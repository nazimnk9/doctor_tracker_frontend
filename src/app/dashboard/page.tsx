'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import {
  Users,
  Stethoscope,
  Activity,
  HeartPulse,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface StatsData {
  summary: {
    totalDoctors: number;
    totalPatients: number;
  };
  patientsPerDoctor: Array<{
    _id: string;
    name: string;
    specialization: string;
    count: number;
  }>;
  admissionsTrend: Array<{
    date: string;
    patients: number;
  }>;
  specializationDistribution: Array<{
    specialization: string;
    doctors: number;
  }>;
}

export default function DashboardPage() {
  const { token, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          setError('Failed to fetch dashboard metrics');
        }
      } catch (err) {
        setError('Connection error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token, API_URL]);

  if (authLoading || loading) {
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

  if (error) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <div className="glass-card error-card">
            <h2>Error Loading Dashboard</h2>
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  // Calculate average patients per doctor
  const avgPatients = stats
    ? stats.summary.totalDoctors > 0
      ? (stats.summary.totalPatients / stats.summary.totalDoctors).toFixed(1)
      : '0.0'
    : '0.0';

  // Bar colors for specialization chart
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1>Administrative Dashboard</h1>
            <p>Overview of clinical operations, doctor specializations, and patient enrollment.</p>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        {stats && (
          <div className="dashboard-grid">
            <div className="glass-card metric-card">
              <div className="metric-icon-wrapper doctors">
                <Stethoscope size={24} />
              </div>
              <div className="metric-details">
                <span className="metric-label">Total Doctors</span>
                <span className="metric-value">{stats.summary.totalDoctors}</span>
              </div>
            </div>

            <div className="glass-card metric-card">
              <div className="metric-icon-wrapper patients">
                <Users size={24} />
              </div>
              <div className="metric-details">
                <span className="metric-label">Total Patients</span>
                <span className="metric-value">{stats.summary.totalPatients}</span>
              </div>
            </div>

            <div className="glass-card metric-card">
              <div className="metric-icon-wrapper average">
                <HeartPulse size={24} />
              </div>
              <div className="metric-details">
                <span className="metric-label">Avg Patients / Doc</span>
                <span className="metric-value">{avgPatients}</span>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {stats && mounted && (
          <>
            <div className="charts-grid">
              {/* Patient Admissions Trend */}
              <div className="glass-card chart-card">
                <div className="chart-header">
                  <div className="chart-title-wrapper">
                    <TrendingUp size={18} className="chart-icon" />
                    <h3>Patient Admissions Trend</h3>
                  </div>
                  <span className="chart-subtitle">Registrations over time</span>
                </div>
                <div className="chart-wrapper">
                  {stats.admissionsTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={stats.admissionsTrend}>
                        <defs>
                          <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#111827',
                            borderColor: '#1f2937',
                            color: '#f3f4f6',
                            borderRadius: '8px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="patients"
                          stroke="#6366f1"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorPatients)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="no-data-fallback">
                      <span>No patient registration history available.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Specialization Distribution */}
              <div className="glass-card chart-card">
                <div className="chart-header">
                  <div className="chart-title-wrapper">
                    <Activity size={18} className="chart-icon" />
                    <h3>Specializations</h3>
                  </div>
                  <span className="chart-subtitle">Doctors count by category</span>
                </div>
                <div className="chart-wrapper">
                  {stats.specializationDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.specializationDistribution} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                        <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} />
                        <YAxis
                          dataKey="specialization"
                          type="category"
                          stroke="#9ca3af"
                          fontSize={11}
                          tickLine={false}
                          width={90}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#111827',
                            borderColor: '#1f2937',
                            color: '#f3f4f6',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="doctors" radius={[0, 4, 4, 0]} barSize={14}>
                          {stats.specializationDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="no-data-fallback">
                      <span>No specializations registered.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Patients per Doctor Table */}
            <div className="glass-card">
              <div className="card-header">
                <h3>Physicians Patient Load</h3>
                <p>Detailed listing of doctors and patient distribution metrics</p>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Doctor Name</th>
                      <th>Specialization</th>
                      <th>Patients Count</th>
                      <th>Load Index</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.patientsPerDoctor.map((doc) => {
                      let loadClass = 'badge-success';
                      let loadText = 'Low';
                      if (doc.count >= 6) {
                        loadClass = 'badge-danger';
                        loadText = 'High';
                      } else if (doc.count >= 3) {
                        loadClass = 'badge-info';
                        loadText = 'Medium';
                      }

                      return (
                        <tr key={doc._id}>
                          <td style={{ fontWeight: 600 }}>{doc.name}</td>
                          <td>{doc.specialization}</td>
                          <td>{doc.count} patients</td>
                          <td>
                            <span className={`badge ${loadClass}`}>{loadText}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
