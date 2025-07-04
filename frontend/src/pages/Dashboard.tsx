import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { FaUpload, FaMicroscope, FaExclamationTriangle, FaUser, FaChartBar, FaVials } from 'react-icons/fa'
import './Dashboard.css'

interface DashboardStats {
  totalPatients: number
  totalScans: number
  activeAlerts: number
  recentSegmentations: number
}

interface RecentActivity {
  id: string
  type: 'scan_upload' | 'segmentation' | 'alert'
  patientId: string
  patientName: string
  timestamp: string
  description: string
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalScans: 0,
    activeAlerts: 0,
    recentSegmentations: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  const mockStats: DashboardStats = {
    totalPatients: 24,
    totalScans: 156,
    activeAlerts: 3,
    recentSegmentations: 12
  }

  const mockActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'scan_upload',
      patientId: 'P001',
      patientName: 'John Doe',
      timestamp: '2024-01-15T10:30:00Z',
      description: 'New MRI scan uploaded'
    },
    {
      id: '2',
      type: 'segmentation',
      patientId: 'P002',
      patientName: 'Jane Smith',
      timestamp: '2024-01-15T09:15:00Z',
      description: 'Tumor segmentation completed'
    },
    {
      id: '3',
      type: 'alert',
      patientId: 'P003',
      patientName: 'Bob Johnson',
      timestamp: '2024-01-15T08:45:00Z',
      description: 'Rapid growth alert triggered'
    }
  ]

  const tumorTrendData = [
    { date: '2024-01-01', volume: 35.2 },
    { date: '2024-01-08', volume: 36.1 },
    { date: '2024-01-15', volume: 37.8 },
    { date: '2024-01-22', volume: 38.5 },
    { date: '2024-01-29', volume: 39.2 }
  ]

  const scanTypeData = [
    { name: 'T1', value: 45 },
    { name: 'T2', value: 35 },
    { name: 'FLAIR', value: 20 }
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats(mockStats)
      setRecentActivity(mockActivity)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-content">
          <div className="loading">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Cancer Monitoring Dashboard</h1>
          <p>Comprehensive overview of patient monitoring and tumor tracking</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><FaUser /></div>
            <div className="stat-content">
              <h3>{stats.totalPatients}</h3>
              <p>Total Patients</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaChartBar /></div>
            <div className="stat-content">
              <h3>{stats.totalScans}</h3>
              <p>Total Scans</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaExclamationTriangle /></div>
            <div className="stat-content">
              <h3>{stats.activeAlerts}</h3>
              <p>Active Alerts</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaVials /></div>
            <div className="stat-content">
              <h3>{stats.recentSegmentations}</h3>
              <p>Recent Segmentations</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <h3>Tumor Volume Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tumorTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="volume" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Scan Types Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={scanTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {scanTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'scan_upload' && <FaUpload />}
                  {activity.type === 'segmentation' && <FaMicroscope />}
                  {activity.type === 'alert' && <FaExclamationTriangle />}
                </div>
                <div className="activity-content">
                  <p className="activity-description">{activity.description}</p>
                  <p className="activity-patient">
                    Patient: <Link to={`/patients/${activity.patientId}`}>{activity.patientName}</Link>
                  </p>
                  <p className="activity-time">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <Link to="/upload" className="action-button">
              <FaUpload /> Upload New Scan
            </Link>
            <Link to="/patients" className="action-button">
              <FaUser /> View All Patients
            </Link>
            <button className="action-button">
              <FaChartBar /> Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
