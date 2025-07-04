import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

const Navigation = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <h1>🏥 Cancer Monitor</h1>
          </Link>
        </div>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/patients" 
              className={`nav-link ${isActive('/patients') ? 'active' : ''}`}
            >
              Patients
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/upload" 
              className={`nav-link ${isActive('/upload') ? 'active' : ''}`}
            >
              Upload Scan
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation 