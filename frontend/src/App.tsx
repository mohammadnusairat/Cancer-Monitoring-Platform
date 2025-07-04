import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/Dashboard'
import UploadForm from './pages/UploadForm'
import PatientList from './pages/PatientList'
import PatientDetail from './pages/PatientDetail'
import Navigation from './components/Navigation'

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/:patientId" element={<PatientDetail />} />
            <Route path="/upload" element={<UploadForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
