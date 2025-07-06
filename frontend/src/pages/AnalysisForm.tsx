import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AnalysisForm.css";

interface AnalysisResult {
  scan_id: string;
  modality: string;
  segmentation_id: string;
  model_name: string;
  tumor_volume_cc: number;
  tumor_volume_mm3: number;
  confidence_score: number;
  processing_time_seconds: number;
  mask_path: string;
  analysis_details: any;
  status: string;
}

const AnalysisForm = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<"pending" | "processing" | "complete" | "error">("pending");

  useEffect(() => {
    if (scanId) {
      checkAnalysisStatus();
    }
  }, [scanId]);

  const checkAnalysisStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/analyze/status/${scanId}`);
      const data = await response.json();
      
      if (response.ok) {
        if (data.status === "completed") {
          setAnalysisResult(data);
          setAnalysisStep("complete");
        } else {
          setAnalysisStep("pending");
        }
      } else {
        setError(data.detail || "Failed to check analysis status");
        setAnalysisStep("error");
      }
    } catch (err) {
      setError("Network error while checking analysis status");
      setAnalysisStep("error");
    }
  };

  const startAnalysis = async () => {
    if (!scanId) return;

    setLoading(true);
    setAnalysisStep("processing");

    try {
      const response = await fetch(`http://localhost:8000/api/v1/analyze/?scan_id=${scanId}`);
      const data = await response.json();

      if (response.ok) {
        setAnalysisResult(data);
        setAnalysisStep("complete");
      } else {
        setError(data.detail || "Analysis failed");
        setAnalysisStep("error");
      }
    } catch (err) {
      setError("Network error during analysis");
      setAnalysisStep("error");
    } finally {
      setLoading(false);
    }
  };

  const getModelDescription = (modelName: string) => {
    const descriptions = {
      "TumorTrace": "Advanced MRI segmentation model for brain tumor detection and volume calculation",
      "nnUNet": "State-of-the-art CT scan analysis model for lesion detection and segmentation",
      "CheXNet": "Deep learning model for X-ray abnormality detection and classification"
    };
    return descriptions[modelName as keyof typeof descriptions] || "Medical imaging analysis model";
  };

  const getModalityIcon = (modality: string) => {
    switch (modality.toUpperCase()) {
      case "MRI":
        return "🧠";
      case "CT":
        return "🫁";
      case "XRAY":
        return "📷";
      default:
        return "🔬";
    }
  };

  return (
    <div className="analysis-page">
      <div className="analysis-content">
        <div className="analysis-header">
          <h1>Medical Image Analysis</h1>
          <p>AI-powered analysis of medical imaging scans</p>
        </div>

        <div className="analysis-container">
          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step ${analysisStep === "pending" ? "active" : ""} ${analysisStep !== "pending" ? "completed" : ""}`}>
              <span className="step-number">1</span>
              <span className="step-label">Ready</span>
            </div>
            <div className={`step ${analysisStep === "processing" ? "active" : ""} ${analysisStep === "complete" ? "completed" : ""}`}>
              <span className="step-number">2</span>
              <span className="step-label">Analyzing</span>
            </div>
            <div className={`step ${analysisStep === "complete" ? "active" : ""}`}>
              <span className="step-number">3</span>
              <span className="step-label">Results</span>
            </div>
          </div>

          {/* Pending Analysis */}
          {analysisStep === "pending" && (
            <div className="pending-section">
              <div className="pending-content">
                <div className="scan-info">
                  <h3>Scan Ready for Analysis</h3>
                  <p>Scan ID: {scanId}</p>
                  <p>Click the button below to start AI analysis</p>
                </div>
                <button
                  onClick={startAnalysis}
                  disabled={loading}
                  className="analyze-btn"
                >
                  Start Analysis
                </button>
              </div>
            </div>
          )}

          {/* Processing Analysis */}
          {analysisStep === "processing" && (
            <div className="processing-section">
              <div className="processing-animation">
                <div className="spinner"></div>
              </div>
              <h3>Running AI Analysis</h3>
              <p>Processing medical image with advanced machine learning models...</p>
              <div className="processing-steps">
                <div className="step-item">
                  <span className="step-icon">✓</span>
                  <span>Loading scan data</span>
                </div>
                <div className="step-item">
                  <span className="step-icon">⏳</span>
                  <span>Running AI model inference</span>
                </div>
                <div className="step-item">
                  <span className="step-icon">⏳</span>
                  <span>Generating analysis results</span>
                </div>
                <div className="step-item">
                  <span className="step-icon">⏳</span>
                  <span>Calculating metrics</span>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Complete */}
          {analysisStep === "complete" && analysisResult && (
            <div className="complete-section">
              <div className="success-animation">
                <span className="success-icon">✓</span>
              </div>
              <h3>Analysis Complete!</h3>
              
              <div className="result-summary">
                <div className="result-header">
                  <span className="modality-icon">{getModalityIcon(analysisResult.modality)}</span>
                  <h4>{analysisResult.modality} Analysis Results</h4>
                </div>
                
                <div className="result-grid">
                  <div className="result-item">
                    <label>Model Used:</label>
                    <span className="model-name">{analysisResult.model_name}</span>
                    <small>{getModelDescription(analysisResult.model_name)}</small>
                  </div>
                  
                  <div className="result-item">
                    <label>Confidence Score:</label>
                    <span className={`confidence-score ${analysisResult.confidence_score > 0.8 ? 'high' : analysisResult.confidence_score > 0.6 ? 'medium' : 'low'}`}>
                      {(analysisResult.confidence_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  {analysisResult.modality !== "XRAY" && (
                    <>
                      <div className="result-item">
                        <label>Tumor Volume:</label>
                        <span>{analysisResult.tumor_volume_cc.toFixed(2)} cc</span>
                      </div>
                      <div className="result-item">
                        <label>Volume (mm³):</label>
                        <span>{analysisResult.tumor_volume_mm3.toFixed(0)} mm³</span>
                      </div>
                    </>
                  )}
                  
                  {analysisResult.modality === "XRAY" && analysisResult.analysis_details?.abnormality_types && (
                    <div className="result-item">
                      <label>Detected Abnormalities:</label>
                      <span>{analysisResult.analysis_details.abnormality_types.join(", ")}</span>
                    </div>
                  )}
                  
                  <div className="result-item">
                    <label>Processing Time:</label>
                    <span>{analysisResult.processing_time_seconds.toFixed(1)} seconds</span>
                  </div>
                </div>

                {analysisResult.analysis_details && (
                  <div className="analysis-details">
                    <h5>Detailed Analysis</h5>
                    <pre>{JSON.stringify(analysisResult.analysis_details, null, 2)}</pre>
                  </div>
                )}
              </div>

              <div className="complete-actions">
                <button onClick={() => navigate(`/patients`)} className="action-btn primary">
                  View All Patients
                </button>
                <button onClick={() => navigate(`/upload`)} className="action-btn secondary">
                  Upload Another Scan
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {analysisStep === "error" && (
            <div className="error-section">
              <div className="error-animation">
                <span className="error-icon">⚠</span>
              </div>
              <h3>Analysis Failed</h3>
              <p>{error}</p>
              <div className="error-actions">
                <button onClick={startAnalysis} className="action-btn primary">
                  Retry Analysis
                </button>
                <button onClick={() => navigate(`/patients`)} className="action-btn secondary">
                  Back to Patients
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisForm; 