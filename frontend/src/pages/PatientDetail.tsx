import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FaUpload, FaChartBar } from 'react-icons/fa'
import './PatientDetail.css'

interface Patient {
  id: string
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  diagnosis: string
  created_at: string
}

interface Scan {
  id: string
  scan_date: string
  scan_type: string
  modality: string
  body_part: string
  file_path: string
  segmentation?: Segmentation
}

interface Segmentation {
  id: string
  tumor_volume_cc: number
  tumor_volume_mm3: number
  confidence_score: number
  processing_time_seconds: number
  mask_path: string
}

interface Alert {
  id: string
  alert_type: string
  severity: string
  message: string
  created_at: string
  is_resolved: boolean
}

const PatientDetail = () => {
  const { patientId } = useParams<{ patientId: string }>()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [scans, setScans] = useState<Scan[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data for demonstration
  const mockPatient: Patient = {
    id: '1',
    patient_id: 'P001',
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1985-03-15',
    gender: 'Male',
    diagnosis: 'Glioblastoma',
    created_at: '2024-01-01T10:00:00Z'
  }

  const mockScans: Scan[] = [
    {
      id: '1',
      scan_date: '2024-01-01T10:00:00Z',
      scan_type: 'T1',
      modality: 'MRI',
      body_part: 'Brain',
      file_path: '/scans/scan1.nii.gz',
      segmentation: {
        id: '1',
        tumor_volume_cc: 35.2,
        tumor_volume_mm3: 35200,
        confidence_score: 0.85,
        processing_time_seconds: 2.5,
        mask_path: '/masks/mask1.nii.gz'
      }
    },
    {
      id: '2',
      scan_date: '2024-01-08T10:00:00Z',
      scan_type: 'T2',
      modality: 'MRI',
      body_part: 'Brain',
      file_path: '/scans/scan2.nii.gz',
      segmentation: {
        id: '2',
        tumor_volume_cc: 36.1,
        tumor_volume_mm3: 36100,
        confidence_score: 0.87,
        processing_time_seconds: 2.3,
        mask_path: '/masks/mask2.nii.gz'
      }
    },
    {
      id: '3',
      scan_date: '2024-01-15T10:00:00Z',
      scan_type: 'FLAIR',
      modality: 'MRI',
      body_part: 'Brain',
      file_path: '/scans/scan3.nii.gz',
      segmentation: {
        id: '3',
        tumor_volume_cc: 37.8,
        tumor_volume_mm3: 37800,
        confidence_score: 0.89,
        processing_time_seconds: 2.7,
        mask_path: '/masks/mask3.nii.gz'
      }
    }
  ]

  const mockAlerts: Alert[] = [
    {
      id: '1',
      alert_type: 'rapid_growth',
      severity: 'high',
      message: 'Rapid tumor growth detected: 0.15 cc/month',
      created_at: '2024-01-15T08:45:00Z',
      is_resolved: false
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPatient(mockPatient)
      setScans(mockScans)
      setAlerts(mockAlerts)
      setLoading(false)
    }, 1000)
  }, [patientId])

  const getAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const tumorTrendData = scans
    .filter(scan => scan.segmentation)
    .map(scan => ({
      date: new Date(scan.scan_date).toLocaleDateString(),
      volume: scan.segmentation!.tumor_volume_cc,
      scan_type: scan.scan_type
    }))

  if (loading) {
    return (
      <div className="patient-detail-page">
        <div className="patient-detail-content">
          <div className="loading">Loading patient details...</div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="patient-detail-page">
        <div className="patient-detail-content">
          <div className="error">Patient not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="patient-detail-page">
      <div className="patient-detail-content">
        {/* Patient Header */}
        <div className="patient-header">
          <div className="patient-info">
            <h1>{patient.first_name} {patient.last_name}</h1>
            <p className="patient-id">Patient ID: {patient.patient_id}</p>
            <div className="patient-meta">
              <span>Age: {getAge(patient.date_of_birth)}</span>
              <span>Gender: {patient.gender}</span>
              <span>Diagnosis: {patient.diagnosis}</span>
            </div>
          </div>
          <div className="patient-actions">
            <Link to="/upload" className="action-btn primary">
              <FaUpload /> Upload New Scan
            </Link>
            <button className="action-btn secondary">
              <FaChartBar /> Generate Report
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'scans' ? 'active' : ''}`}
            onClick={() => setActiveTab('scans')}
          >
            Scans ({scans.length})
          </button>
          <button 
            className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            Alerts ({alerts.filter(a => !a.is_resolved).length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              {/* Tumor Trend Chart */}
              <div className="chart-section">
                <h3>Tumor Volume Trend</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={tumorTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="#667eea" 
                        strokeWidth={3}
                        dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="quick-stats">
                <div className="stat-card">
                  <h4>Latest Volume</h4>
                  <p className="stat-value">
                    {scans[scans.length - 1]?.segmentation?.tumor_volume_cc || 'N/A'} cc
                  </p>
                </div>
                <div className="stat-card">
                  <h4>Growth Rate</h4>
                  <p className="stat-value">+0.15 cc/month</p>
                </div>
                <div className="stat-card">
                  <h4>Active Alerts</h4>
                  <p className="stat-value">{alerts.filter(a => !a.is_resolved).length}</p>
                </div>
                <div className="stat-card">
                  <h4>Total Scans</h4>
                  <p className="stat-value">{scans.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scans' && (
            <div className="scans-tab">
              <div className="scans-grid">
                {scans.map((scan) => (
                  <div key={scan.id} className="scan-card">
                    <div className="scan-header">
                      <h4>{scan.scan_type} - {scan.modality}</h4>
                      <span className="scan-date">
                        {new Date(scan.scan_date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {scan.segmentation && (
                      <div className="segmentation-info">
                        <div className="segmentation-stats">
                          <div className="stat">
                            <label>Volume:</label>
                            <span>{scan.segmentation.tumor_volume_cc} cc</span>
                          </div>
                          <div className="stat">
                            <label>Confidence:</label>
                            <span>{(scan.segmentation.confidence_score * 100).toFixed(1)}%</span>
                          </div>
                          <div className="stat">
                            <label>Processing:</label>
                            <span>{scan.segmentation.processing_time_seconds}s</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="scan-actions">
                      <button className="btn-small">View</button>
                      <button className="btn-small">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="alerts-tab">
              {alerts.length === 0 ? (
                <div className="no-alerts">
                  <p>No alerts for this patient.</p>
                </div>
              ) : (
                <div className="alerts-list">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`alert-item ${alert.severity}`}>
                      <div className="alert-header">
                        <span className={`alert-severity ${alert.severity}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="alert-time">
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="alert-message">{alert.message}</p>
                      {!alert.is_resolved && (
                        <button className="resolve-btn">Mark as Resolved</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientDetail 