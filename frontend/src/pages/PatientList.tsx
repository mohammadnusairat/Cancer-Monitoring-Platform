import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './PatientList.css'

interface Patient {
  id: string
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  diagnosis: string
  created_at: string
  scan_count: number
  latest_scan_date: string
  active_alerts: number
}

const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGender, setFilterGender] = useState('all')

  // Mock data for demonstration
  const mockPatients: Patient[] = [
    {
      id: '1',
      patient_id: 'P001',
      first_name: 'John',
      last_name: 'Doe',
      date_of_birth: '1985-03-15',
      gender: 'Male',
      diagnosis: 'Glioblastoma',
      created_at: '2024-01-01T10:00:00Z',
      scan_count: 8,
      latest_scan_date: '2024-01-15T10:30:00Z',
      active_alerts: 1
    },
    {
      id: '2',
      patient_id: 'P002',
      first_name: 'Jane',
      last_name: 'Smith',
      date_of_birth: '1978-07-22',
      gender: 'Female',
      diagnosis: 'Meningioma',
      created_at: '2024-01-02T14:30:00Z',
      scan_count: 5,
      latest_scan_date: '2024-01-12T09:15:00Z',
      active_alerts: 0
    },
    {
      id: '3',
      patient_id: 'P003',
      first_name: 'Bob',
      last_name: 'Johnson',
      date_of_birth: '1992-11-08',
      gender: 'Male',
      diagnosis: 'Astrocytoma',
      created_at: '2024-01-03T16:45:00Z',
      scan_count: 12,
      latest_scan_date: '2024-01-14T11:20:00Z',
      active_alerts: 2
    },
    {
      id: '4',
      patient_id: 'P004',
      first_name: 'Alice',
      last_name: 'Brown',
      date_of_birth: '1980-05-12',
      gender: 'Female',
      diagnosis: 'Oligodendroglioma',
      created_at: '2024-01-04T08:20:00Z',
      scan_count: 6,
      latest_scan_date: '2024-01-10T15:45:00Z',
      active_alerts: 0
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPatients(mockPatients)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesGender = filterGender === 'all' || patient.gender === filterGender
    
    return matchesSearch && matchesGender
  })

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

  const getAlertSeverity = (alertCount: number) => {
    if (alertCount === 0) return 'none'
    if (alertCount === 1) return 'low'
    if (alertCount === 2) return 'medium'
    return 'high'
  }

  if (loading) {
    return (
      <div className="patient-list-page">
        <div className="patient-list-content">
          <div className="loading-centered">Loading patients...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="patient-list-page">
      <div className="patient-list-content">
        <div className="patient-list">
          <div className="patient-list-header">
            <h1>Patient Management</h1>
            <p>Monitor and manage all cancer patients in the system</p>
          </div>

          {/* Search and Filters */}
          <div className="search-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search patients by name, ID, or diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filters">
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Patient Stats */}
          <div className="patient-stats">
            <div className="stat-item">
              <span className="stat-number">{patients.length}</span>
              <span className="stat-label">Total Patients</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{patients.filter(p => p.active_alerts > 0).length}</span>
              <span className="stat-label">Patients with Alerts</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{patients.reduce((sum, p) => sum + p.scan_count, 0)}</span>
              <span className="stat-label">Total Scans</span>
            </div>
          </div>

          {/* Patient Table */}
          <div className="patient-table-container">
            <table className="patient-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Diagnosis</th>
                  <th>Scans</th>
                  <th>Latest Scan</th>
                  <th>Alerts</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <span className="patient-id">{patient.patient_id}</span>
                    </td>
                    <td>
                      <div className="patient-name">
                        <span className="full-name">{patient.first_name} {patient.last_name}</span>
                      </div>
                    </td>
                    <td>{getAge(patient.date_of_birth)}</td>
                    <td>
                      <span className={`gender-badge ${patient.gender.toLowerCase()}`}>
                        {patient.gender}
                      </span>
                    </td>
                    <td>
                      <span className="diagnosis">{patient.diagnosis}</span>
                    </td>
                    <td>
                      <span className="scan-count">{patient.scan_count}</span>
                    </td>
                    <td>
                      {patient.latest_scan_date ? 
                        new Date(patient.latest_scan_date).toLocaleDateString() : 
                        'No scans'
                      }
                    </td>
                    <td>
                      {patient.active_alerts > 0 ? (
                        <span className={`alert-badge ${getAlertSeverity(patient.active_alerts)}`}>
                          {patient.active_alerts}
                        </span>
                      ) : (
                        <span className="no-alerts">-</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/patients/${patient.patient_id}`}
                          className="action-btn view-btn"
                        >
                          👁️ View
                        </Link>
                        <button className="action-btn upload-btn">
                          📤 Upload
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPatients.length === 0 && (
            <div className="no-results">
              <p>No patients found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientList 