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
  const [histopathResult, setHistopathResult] = useState<any>(null);
  const [histopathLoading, setHistopathLoading] = useState(false);
  const [histopathError, setHistopathError] = useState<string | null>(null);

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
    formData.append("modality", modality === "Histopathology" ? "HISTOPATH" : modality);
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
        // If Histopathology, trigger analysis immediately
        if (modality === "Histopathology") {
          setHistopathLoading(true);
          setHistopathError(null);
          setHistopathResult(null);
          // Use the uploaded filename from the response or file
          const uploadedFilename = data.filename || (file ? file.name : "");
          const scanId = data.scan_id;
          try {
            const analyzeRes = await fetch(`http://localhost:8000/api/v1/analyze/?scan_id=${scanId}`);
            const analyzeData = await analyzeRes.json();
            if (analyzeRes.ok) {
              setHistopathResult(analyzeData);
              setUploadStep("complete");
            } else {
              setHistopathError(analyzeData.detail || "Analysis failed");
              setUploadStep("complete");
            }
          } catch (err) {
            setHistopathError("Network error during analysis");
            setUploadStep("complete");
          } finally {
            setHistopathLoading(false);
            setLoading(false);
          }
        } else {
          // Simulate processing time and redirect to analysis
          setTimeout(() => {
            setUploadStep("complete");
            setLoading(false);
            setTimeout(() => {
              navigate(`/analyze/${data.scan_id}`);
            }, 2000);
          }, 3000);
        }
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
    const newScanTypes = scanTypesExtended[newModality] || ["T1"];
    setScanType(newScanTypes[0]);
    // For histopathology, set body part to Breast
    if (newModality === "Histopathology") {
      setBodyPart("Breast");
    }
  };

  // Extend scanTypes to include Histopathology
  const scanTypesExtended: { [key: string]: string[] } = {
    ...scanTypes,
    "Histopathology": ["H&E"]
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
                  accept={
                    modality === "XRAY"
                      ? ".dcm,.dicom,.jpg,.jpeg,.png,.tiff,.tif"
                      : modality === "Histopathology"
                        ? ".jpg,.jpeg,.png,.bmp,.tiff,.tif"
                        : ".nii.gz,.nii,.dcm,.dicom,.mha,.mhd"
                  }
                  required
                />
                <small className="file-help">
                  {modality === "XRAY"
                    ? "Supported formats: DICOM (.dcm, .dicom), JPEG (.jpg, .jpeg), PNG (.png), TIFF (.tiff, .tif)"
                    : modality === "Histopathology"
                      ? "Supported formats: JPEG (.jpg, .jpeg), PNG (.png), BMP (.bmp), TIFF (.tiff, .tif)"
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
                    {scanTypesExtended[modality]?.map((type: string) => (
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
                    <option value="Histopathology">Histopathology</option>
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
              <p>{modality === "Histopathology" ? "Running histopathology classification..." : "Running tumor segmentation analysis..."}</p>
              <div className="processing-steps">
                <div className="step-item">
                  <span className="step-icon">✓</span>
                  <span>File uploaded successfully</span>
                </div>
                <div className="step-item">
                  <span className="step-icon">⏳</span>
                  <span>{modality === "Histopathology" ? "Running CNN classification" : modality === "MRI" ? "Running TumorTrace" : modality === "CT" ? "Running nnUNet" : "Running CheXNet"} analysis</span>
                </div>
                <div className="step-item">
                  <span className="step-icon">⏳</span>
                  <span>{modality === "Histopathology" ? "Calculating class probabilities" : modality === "XRAY" ? "Calculating abnormality area" : "Calculating tumor volume"}</span>
                </div>
                <div className="step-item">
                  <span className="step-icon">⏳</span>
                  <span>{modality === "Histopathology" ? "Generating classification report" : modality === "XRAY" ? "Generating detection mask" : "Generating segmentation mask"}</span>
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
              {/* Histopathology Results */}
              {modality === "Histopathology" && histopathLoading && (
                <div className="processing-section">
                  <div className="processing-animation">
                    <div className="spinner"></div>
                  </div>
                  <h3>Analyzing Histopathology Image...</h3>
                  <p>Running CNN-based classification...</p>
                </div>
              )}
              {modality === "Histopathology" && histopathError && (
                <div className="error-section">
                  <div className="error-animation">
                    <span className="error-icon">⚠</span>
                  </div>
                  <h3>Analysis Failed</h3>
                  <p>{histopathError}</p>
                </div>
              )}
              {modality === "Histopathology" && histopathResult && (
                <div className="result-summary">
                  <h4>Histopathology Classification Results</h4>
                  <div className="result-grid">
                    <div className="result-item">
                      <label>Predicted Class:</label>
                      <span>{histopathResult.analysis_details?.predicted_class}</span>
                    </div>
                    <div className="result-item">
                      <label>Confidence:</label>
                      <span>{(histopathResult.confidence_score * 100).toFixed(1)}%</span>
                    </div>
                    <div className="result-item">
                      <label>Malignant:</label>
                      <span>{histopathResult.analysis_details?.is_malignant ? "Yes" : "No"}</span>
                    </div>
                  </div>
                  <div className="result-item">
                    <label>Class Probabilities:</label>
                    <ul>
                      {histopathResult.analysis_details?.class_probabilities &&
                        Object.entries(histopathResult.analysis_details.class_probabilities).map(
                          ([label, prob]) => (
                            <li key={label}>
                              {label}: {((prob as number) * 100).toFixed(1)}%
                            </li>
                          )
                        )}
                    </ul>
                  </div>
                </div>
              )}
              {/* Default result summary for other modalities */}
              {modality !== "Histopathology" && response && (
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
