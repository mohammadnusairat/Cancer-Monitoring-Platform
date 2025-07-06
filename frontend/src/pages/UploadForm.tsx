import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UploadForm.css";

interface Patient {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
}

const UploadForm = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [scanDate, setScanDate] = useState<string>("");
  const [scanType, setScanType] = useState<string>("T1");
  const [modality, setModality] = useState<string>("MRI");
  const [scanTypes, setScanTypes] = useState<{[key: string]: string[]}>({
    "MRI": ["T1", "T2", "FLAIR", "T1c", "DWI"],
    "CT": ["Non-contrast", "Contrast", "CECT", "HRCT"],
    "XRAY": ["Chest PA", "Chest Lateral", "Abdomen", "Pelvis", "Spine"]
  });
  const [bodyPart, setBodyPart] = useState<string>("Brain");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [uploadStep, setUploadStep] = useState<"upload" | "processing" | "complete">("upload");

  // Mock patients data
  const mockPatients: Patient[] = [
    { id: "1", patient_id: "P001", first_name: "John", last_name: "Doe" },
    { id: "2", patient_id: "P002", first_name: "Jane", last_name: "Smith" },
    { id: "3", patient_id: "P003", first_name: "Bob", last_name: "Johnson" },
  ];

  useEffect(() => {
    // Simulate fetching patients
    setPatients(mockPatients);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const validateForm = () => {
    if (!file) {
      alert("Please select a file");
      return false;
    }
    if (!selectedPatient) {
      alert("Please select a patient");
      return false;
    }
    if (!scanDate) {
      alert("Please select a scan date");
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setUploadStep("upload");

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    formData.append("patient_id", selectedPatient);
    formData.append("scan_date", scanDate);
    formData.append("scan_type", scanType);
    formData.append("modality", modality);
    formData.append("body_part", bodyPart);

    try {
      const res = await fetch("http://localhost:8000/api/v1/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setResponse(data);
        setUploadStep("processing");
        
        // Simulate processing time and redirect to analysis
        setTimeout(() => {
          setUploadStep("complete");
          setLoading(false);
          // Redirect to analysis page after a short delay
          setTimeout(() => {
            navigate(`/analyze/${data.scan_id}`);
          }, 2000);
        }, 3000);
      } else {
        alert(`Upload failed: ${data.detail || "Unknown error"}`);
        setLoading(false);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setSelectedPatient("");
    setScanDate("");
    setScanType("T1");
    setModality("MRI");
    setBodyPart("Brain");
    setResponse(null);
    setUploadStep("upload");
  };

  const handleModalityChange = (newModality: string) => {
    setModality(newModality);
    // Reset scan type to first option for new modality
    const newScanTypes = scanTypes[newModality] || ["T1"];
    setScanType(newScanTypes[0]);
  };

  return (
    <div className="upload-page">
      <div className="upload-content">
        <div className="upload-header">
          <h1>Upload Medical Scan</h1>
          <p>Upload and process medical imaging scans for tumor segmentation</p>
        </div>

        <div className="upload-container">
          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step ${uploadStep === "upload" ? "active" : ""} ${uploadStep !== "upload" ? "completed" : ""}`}>
              <span className="step-number">1</span>
              <span className="step-label">Upload</span>
            </div>
            <div className={`step ${uploadStep === "processing" ? "active" : ""} ${uploadStep === "complete" ? "completed" : ""}`}>
              <span className="step-number">2</span>
              <span className="step-label">Processing</span>
            </div>
            <div className={`step ${uploadStep === "complete" ? "active" : ""}`}>
              <span className="step-number">3</span>
              <span className="step-label">Complete</span>
            </div>
          </div>

          {/* Upload Form */}
          {uploadStep === "upload" && (
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="patient">Patient *</label>
                <select
                  id="patient"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.patient_id}>
                      {patient.patient_id} - {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="file">Medical Scan File *</label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="form-control"
                  accept={modality === "XRAY" ? ".dcm,.dicom,.jpg,.jpeg,.png,.tiff,.tif" : ".nii.gz,.nii,.dcm,.dicom,.mha,.mhd"}
                  required
                />
                <small className="file-help">
                  {modality === "XRAY" 
                    ? "Supported formats: DICOM (.dcm, .dicom), JPEG (.jpg, .jpeg), PNG (.png), TIFF (.tiff, .tif)"
                    : "Supported formats: NIfTI (.nii.gz, .nii), DICOM (.dcm, .dicom), MetaImage (.mha, .mhd)"
                  }
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="scanDate">Scan Date *</label>
                  <input
                    type="date"
                    id="scanDate"
                    value={scanDate}
                    onChange={(e) => setScanDate(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="scanType">Scan Type</label>
                  <select
                    id="scanType"
                    value={scanType}
                    onChange={(e) => setScanType(e.target.value)}
                    className="form-control"
                  >
                    {scanTypes[modality]?.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="modality">Modality</label>
                  <select
                    id="modality"
                    value={modality}
                    onChange={(e) => handleModalityChange(e.target.value)}
                    className="form-control"
                  >
                    <option value="MRI">MRI</option>
                    <option value="CT">CT</option>
                    <option value="XRAY">X-Ray</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="bodyPart">Body Part</label>
                  <select
                    id="bodyPart"
                    value={bodyPart}
                    onChange={(e) => setBodyPart(e.target.value)}
                    className="form-control"
                  >
                    <option value="Brain">Brain</option>
                    <option value="Chest">Chest</option>
                    <option value="Chest PA">Chest PA</option>
                    <option value="Chest Lateral">Chest Lateral</option>
                    <option value="Abdomen">Abdomen</option>
                    <option value="Pelvis">Pelvis</option>
                    <option value="Spine">Spine</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="upload-btn"
                >
                  {loading ? "Uploading..." : "Upload & Process"}
                </button>
                <Link to="/patients" className="cancel-btn">
                  Cancel
                </Link>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {uploadStep === "processing" && (
            <div className="processing-section">
              <div className="processing-animation">
                <div className="spinner"></div>
              </div>
              <h3>Processing Scan</h3>
              <p>Running tumor segmentation analysis...</p>
              <div className="processing-steps">
                <div className="step-item">
                  <span className="step-icon">✓</span>
                  <span>File uploaded successfully</span>
                </div>
                <div className="step-item">
                  <span className="step-icon">⏳</span>
                  <span>Running {modality === "MRI" ? "TumorTrace" : modality === "CT" ? "nnUNet" : "CheXNet"} analysis</span>
                </div>
                <div className="step-item">
                  <span className="step-icon">⏳</span>
                  <span>Calculating {modality === "XRAY" ? "abnormality area" : "tumor volume"}</span>
                </div>
                <div className="step-item">
                  <span className="step-icon">⏳</span>
                  <span>Generating {modality === "XRAY" ? "detection mask" : "segmentation mask"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {uploadStep === "complete" && (
            <div className="complete-section">
              <div className="success-animation">
                <span className="success-icon">✓</span>
              </div>
              <h3>Upload Complete!</h3>
              <p>Your scan has been successfully processed.</p>
              
              {response && (
                <div className="result-summary">
                  <h4>Processing Results</h4>
                  <div className="result-grid">
                    <div className="result-item">
                      <label>Scan ID:</label>
                      <span>{response.scan_id}</span>
                    </div>
                    <div className="result-item">
                      <label>Status:</label>
                      <span className="status-success">{response.status}</span>
                    </div>
                    <div className="result-item">
                      <label>Message:</label>
                      <span>{response.message}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="complete-actions">
                <Link to={`/patients/${selectedPatient}`} className="action-btn primary">
                  View Patient Details
                </Link>
                <button onClick={resetForm} className="action-btn secondary">
                  Upload Another Scan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadForm;
