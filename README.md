# 🏥 Cancer Patient Monitoring Platform

A comprehensive full-stack application for monitoring cancer patients with advanced tumor segmentation and longitudinal tracking capabilities.

## 🚀 Features

### Core Functionality
- **Patient Management**: Complete patient records with demographics and medical history
- **Medical Scan Upload**: Support for NIfTI, DICOM, and MetaImage formats
- **Tumor Segmentation**: AI-powered segmentation using TumorTrace integration
- **Longitudinal Monitoring**: Track tumor volume changes over time
- **Alert System**: Automated alerts for rapid growth or concerning trends
- **Interactive Dashboard**: Real-time analytics and visualization

### Technical Stack
- **Backend**: FastAPI (Python) with SQLAlchemy ORM
- **Frontend**: React with TypeScript and Vite
- **Database**: PostgreSQL (production) / SQLite (development)
- **Medical Imaging**: Nibabel for NIfTI processing
- **Visualization**: Recharts for data visualization
- **UI/UX**: Modern, responsive design with medical-grade interface

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- PostgreSQL (optional, SQLite used by default)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cancer-monitoring-platform
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

## 🚀 Running the Application

### Development Mode

1. **Start the Backend**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. **Start the Frontend**
```bash
cd frontend
npm run dev
```

3. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Production Mode

1. **Build the Frontend**
```bash
cd frontend
npm run build
```

2. **Run with Docker**
```bash
docker-compose up -d
```

## 📁 Project Structure

```
cancer-monitoring-platform/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/
│   │   │   ├── patients.py      # Patient management endpoints
│   │   │   ├── segment.py       # Segmentation endpoints
│   │   │   └── monitor.py       # Monitoring endpoints
│   │   ├── core/
│   │   │   └── schemas.py       # Pydantic schemas
│   │   ├── db/
│   │   │   ├── database.py      # Database configuration
│   │   │   └── models.py        # SQLAlchemy models
│   │   └── main.py              # FastAPI application
│   ├── data/
│   │   ├── uploads/             # Uploaded medical scans
│   │   └── masks/               # Generated segmentation masks
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.tsx   # Main navigation
│   │   │   └── Navigation.css
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx    # Main dashboard
│   │   │   ├── PatientList.tsx  # Patient management
│   │   │   ├── PatientDetail.tsx # Individual patient view
│   │   │   ├── UploadForm.tsx   # Scan upload interface
│   │   │   └── *.css            # Component styles
│   │   ├── App.tsx              # Main application
│   │   └── main.tsx             # Application entry point
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml           # Docker configuration
```

## 🔧 API Endpoints

### Patients
- `GET /api/v1/patients/` - List all patients
- `POST /api/v1/patients/` - Create new patient
- `GET /api/v1/patients/{patient_id}` - Get patient details
- `PUT /api/v1/patients/{patient_id}` - Update patient
- `DELETE /api/v1/patients/{patient_id}` - Delete patient

### Segmentation
- `POST /api/v1/segment/upload` - Upload medical scan
- `POST /api/v1/segment/process/{scan_id}` - Process segmentation
- `GET /api/v1/segment/{scan_id}/segmentation` - Get segmentation results

### Monitoring
- `GET /api/v1/monitor/patient/{patient_id}/dashboard` - Patient dashboard
- `GET /api/v1/monitor/patient/{patient_id}/trend` - Tumor trend data
- `GET /api/v1/monitor/patient/{patient_id}/alerts` - Patient alerts
- `POST /api/v1/monitor/patient/{patient_id}/check-alerts` - Check for new alerts

## 🧠 Tumor Segmentation Integration

The platform is designed to integrate with advanced tumor segmentation models:

### TumorTrace Integration
- **Input**: NIfTI, DICOM, or MetaImage files
- **Processing**: AI-powered tumor detection and segmentation
- **Output**: Segmentation masks with volume calculations
- **Metrics**: Tumor volume (cc/mm³), confidence scores, processing time

### cancer-sim-search Integration
- **Longitudinal Analysis**: Track tumor changes over time
- **Growth Rate Calculation**: Automated trend analysis
- **Alert Generation**: Intelligent monitoring and notifications

## 📊 Data Models

### Patient
- Unique patient identifier
- Demographics (name, DOB, gender)
- Medical diagnosis
- Creation and update timestamps

### Scan
- Patient association
- Scan metadata (type, modality, body part)
- File storage path
- Scan date and file size

### Segmentation
- Scan association
- Tumor volume measurements
- Confidence scores
- Processing metadata
- Mask file path

### MonitoringAlert
- Patient association
- Alert type and severity
- Automated message generation
- Resolution tracking

## 🔒 Security & Compliance

- **HIPAA Compliance**: Patient data protection measures
- **File Validation**: Medical image format verification
- **Access Control**: Role-based permissions (future enhancement)
- **Data Encryption**: Secure storage and transmission
- **Audit Logging**: Complete activity tracking

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Integration Testing
```bash
# Run full test suite
npm run test:integration
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=3
```

### Production Considerations
- Use PostgreSQL for production database
- Configure proper CORS settings
- Set up SSL/TLS certificates
- Implement proper logging
- Configure backup strategies
- Set up monitoring and alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/docs`

## 🔮 Roadmap

### Phase 2 Features
- [ ] Real-time notifications
- [ ] Advanced image viewer with overlay
- [ ] Multi-modal image support
- [ ] Automated report generation
- [ ] Mobile application
- [ ] Integration with PACS systems

### Phase 3 Features
- [ ] Machine learning model training
- [ ] Advanced analytics dashboard
- [ ] Clinical decision support
- [ ] Multi-center support
- [ ] Advanced security features

---

**Note**: This is a medical application. Ensure compliance with local healthcare regulations and obtain necessary approvals before clinical use.
