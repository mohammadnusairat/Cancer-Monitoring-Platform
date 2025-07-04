from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.db.database import get_db
from app.db.models import Patient as PatientModel
from app.core.schemas import Patient, PatientCreate

router = APIRouter()

@router.post("/", response_model=Patient, status_code=status.HTTP_201_CREATED)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    """Create a new patient"""
    # Check if patient_id already exists
    existing_patient = db.query(PatientModel).filter(PatientModel.patient_id == patient.patient_id).first()
    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Patient with ID {patient.patient_id} already exists"
        )
    
    db_patient = PatientModel(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.get("/", response_model=List[Patient])
def get_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all patients with pagination"""
    patients = db.query(PatientModel).offset(skip).limit(limit).all()
    return patients

@router.get("/{patient_id}", response_model=Patient)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    """Get a specific patient by ID"""
    patient = db.query(PatientModel).filter(PatientModel.patient_id == patient_id).first()
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found"
        )
    return patient

@router.put("/{patient_id}", response_model=Patient)
def update_patient(patient_id: str, patient_update: PatientCreate, db: Session = Depends(get_db)):
    """Update a patient"""
    db_patient = db.query(PatientModel).filter(PatientModel.patient_id == patient_id).first()
    if db_patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found"
        )
    
    for field, value in patient_update.dict().items():
        setattr(db_patient, field, value)
    
    db_patient.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: str, db: Session = Depends(get_db)):
    """Delete a patient"""
    db_patient = db.query(PatientModel).filter(PatientModel.patient_id == patient_id).first()
    if db_patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found"
        )
    
    db.delete(db_patient)
    db.commit()
    return None 