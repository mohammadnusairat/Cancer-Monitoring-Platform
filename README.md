# 🏥 Multimodal Cancer Imaging Analysis Platform

A comprehensive full-stack application for monitoring cancer patients with advanced AI-powered analysis of multiple imaging modalities including MRI, CT scans, and X-rays.

## 🚀 Features

### Core Functionality
- **Patient Management**: Complete patient records with demographics and medical history
- **Multimodal Imaging Support**: Upload and analyze MRI, CT scans, X-rays, and histopathology images
- **AI-Powered Analysis**: 
  - **MRI**: TumorTrace segmentation for brain tumor detection
  - **CT**: nnUNet analysis for lesion detection and segmentation
  - **X-Ray**: CheXNet for abnormality detection and classification
  - **Histopathology**: CNN-based breast cancer classification (Normal, Benign, In Situ, Invasive)
- **Longitudinal Monitoring**: Track tumor volume changes over time
- **Alert System**: Automated alerts for rapid growth or concerning trends
- **Interactive Dashboard**: Real-time analytics and visualization

### Technical Stack
- **Backend**: FastAPI (Python) with SQLAlchemy ORM
- **Frontend**: React with TypeScript and Vite
- **Database**: PostgreSQL (production) / SQLite (development)
- **Medical Imaging**: 
  - Nibabel for NIfTI processing
  - OpenCV for image processing
  - Pydicom for DICOM handling
- **AI Models**: 
  - TumorTrace for MRI segmentation
  - nnUNet for CT analysis
  - CheXNet for X-ray classification
  - BreastCancerCNN for histopathology classification
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

### Upload & Analysis
- `POST /api/v1/upload/` - Upload medical scan (MRI/CT/X-ray)
- `GET /api/v1/analyze/?scan_id={scan_id}` - Run AI analysis on scan
- `GET /api/v1/analyze/status/{scan_id}` - Check analysis status
- `POST /api/v1/segment/upload` - Legacy upload endpoint
- `POST /api/v1/segment/process/{scan_id}` - Legacy segmentation endpoint
- `GET /api/v1/segment/{scan_id}/segmentation` - Get segmentation results

### Monitoring
- `GET /api/v1/monitor/patient/{patient_id}/dashboard` - Patient dashboard
- `GET /api/v1/monitor/patient/{patient_id}/trend` - Tumor trend data
- `GET /api/v1/monitor/patient/{patient_id}/alerts` - Patient alerts
- `POST /api/v1/monitor/patient/{patient_id}/check-alerts` - Check for new alerts

## 🧠 Multimodal AI Analysis Integration

The platform integrates with state-of-the-art AI models for different imaging modalities:

### MRI Analysis - TumorTrace
- **Input**: NIfTI, DICOM, or MetaImage files
- **Processing**: AI-powered brain tumor detection and segmentation
- **Output**: Segmentation masks with volume calculations
- **Metrics**: Tumor volume (cc/mm³), confidence scores, processing time
- **Specialization**: Brain tumor analysis with T1, T2, FLAIR, T1c, DWI sequences

### CT Analysis - nnUNet
- **Input**: CT scan files (NIfTI, DICOM, MetaImage)
- **Processing**: Advanced lesion detection and segmentation
- **Output**: Segmentation masks with Hounsfield unit analysis
- **Metrics**: Lesion volume, Hounsfield unit ranges, lesion type classification
- **Specialization**: Multi-organ analysis (brain, chest, abdomen, pelvis)

### X-Ray Analysis - CheXNet
- **Input**: X-ray images (DICOM, JPEG, PNG, TIFF)
- **Processing**: Abnormality detection and classification
- **Output**: Detection masks with abnormality classification
- **Metrics**: Abnormality area, classification confidence, image quality score
- **Specialization**: Chest X-ray analysis for pneumonia, nodules, fractures

### Histopathology Analysis - BreastCancerCNN
- **Input**: Histopathology images (JPEG, PNG, BMP, TIFF)
- **Processing**: Breast tissue classification using CNN
- **Output**: Classification results with confidence scores
- **Metrics**: Classification confidence, class probabilities, malignancy detection
- **Specialization**: Breast cancer histopathology analysis (Normal, Benign, In Situ, Invasive)

### Longitudinal Monitoring
- **Multi-Modal Tracking**: Compare results across different modalities
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
