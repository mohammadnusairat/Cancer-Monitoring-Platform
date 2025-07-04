from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, unique=True, nullable=False, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(DateTime, nullable=False)
    gender = Column(String, nullable=False)
    diagnosis = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    scans = relationship("Scan", back_populates="patient", cascade="all, delete-orphan")

class Scan(Base):
    __tablename__ = "scans"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    scan_date = Column(DateTime, nullable=False)
    scan_type = Column(String, nullable=False)  # T1, T2, FLAIR, etc.
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)
    modality = Column(String, nullable=False)  # MRI, CT, etc.
    body_part = Column(String, nullable=False)  # Brain, Chest, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    patient = relationship("Patient", back_populates="scans")
    segmentation = relationship("Segmentation", back_populates="scan", uselist=False, cascade="all, delete-orphan")

class Segmentation(Base):
    __tablename__ = "segmentations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String, ForeignKey("scans.id"), nullable=False)
    mask_path = Column(String, nullable=False)
    tumor_volume_cc = Column(Float)
    tumor_volume_mm3 = Column(Float)
    confidence_score = Column(Float)
    segmentation_method = Column(String, default="TumorTrace")
    processing_time_seconds = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    scan = relationship("Scan", back_populates="segmentation")

class MonitoringAlert(Base):
    __tablename__ = "monitoring_alerts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    alert_type = Column(String, nullable=False)  # growth, shrinkage, new_tumor
    severity = Column(String, nullable=False)  # low, medium, high, critical
    message = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)
    
    # Relationships
    patient = relationship("Patient") 