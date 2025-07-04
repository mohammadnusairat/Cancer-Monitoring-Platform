from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Patient schemas
class PatientBase(BaseModel):
    patient_id: str = Field(..., description="Unique patient identifier")
    first_name: str = Field(..., description="Patient's first name")
    last_name: str = Field(..., description="Patient's last name")
    date_of_birth: datetime = Field(..., description="Patient's date of birth")
    gender: str = Field(..., description="Patient's gender")
    diagnosis: Optional[str] = Field(None, description="Patient's diagnosis")

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Scan schemas
class ScanBase(BaseModel):
    scan_date: datetime = Field(..., description="Date of the scan")
    scan_type: str = Field(..., description="Type of scan (T1, T2, FLAIR, etc.)")
    modality: str = Field(..., description="Imaging modality (MRI, CT, etc.)")
    body_part: str = Field(..., description="Body part scanned")

class ScanCreate(ScanBase):
    patient_id: str = Field(..., description="ID of the patient")

class Scan(ScanBase):
    id: str
    patient_id: str
    file_path: str
    file_size: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Segmentation schemas
class SegmentationBase(BaseModel):
    tumor_volume_cc: Optional[float] = Field(None, description="Tumor volume in cubic centimeters")
    tumor_volume_mm3: Optional[float] = Field(None, description="Tumor volume in cubic millimeters")
    confidence_score: Optional[float] = Field(None, description="Segmentation confidence score")
    segmentation_method: str = Field(default="TumorTrace", description="Method used for segmentation")

class SegmentationCreate(SegmentationBase):
    scan_id: str = Field(..., description="ID of the scan")
    mask_path: str = Field(..., description="Path to the segmentation mask")

class Segmentation(SegmentationBase):
    id: str
    scan_id: str
    mask_path: str
    processing_time_seconds: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Monitoring schemas
class MonitoringAlertBase(BaseModel):
    alert_type: str = Field(..., description="Type of alert (growth, shrinkage, new_tumor)")
    severity: str = Field(..., description="Alert severity (low, medium, high, critical)")
    message: str = Field(..., description="Alert message")

class MonitoringAlertCreate(MonitoringAlertBase):
    patient_id: str = Field(..., description="ID of the patient")

class MonitoringAlert(MonitoringAlertBase):
    id: str
    patient_id: str
    is_resolved: bool
    created_at: datetime
    resolved_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Response schemas
class UploadResponse(BaseModel):
    filename: str
    status: str
    scan_id: str
    message: str

class SegmentationResponse(BaseModel):
    scan_id: str
    segmentation_id: str
    tumor_volume_cc: float
    tumor_volume_mm3: float
    confidence_score: float
    processing_time_seconds: float
    mask_path: str

class PatientDashboard(BaseModel):
    patient: Patient
    scans: List[Scan]
    latest_segmentation: Optional[Segmentation]
    alerts: List[MonitoringAlert]
    tumor_trend: List[dict]  # Volume over time data 