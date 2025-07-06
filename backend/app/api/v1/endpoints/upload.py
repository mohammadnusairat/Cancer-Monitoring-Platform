from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import shutil
import os
import uuid
from datetime import datetime
from typing import Optional

from app.db.database import get_db
from app.db.models import Scan as ScanModel, Patient as PatientModel
from app.core.schemas import UploadResponse

router = APIRouter()

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def validate_medical_file(filename: str, modality: str) -> bool:
    """Validate if the uploaded file is a supported medical image format for the given modality"""
    # MRI formats
    mri_extensions = ['.nii.gz', '.nii', '.dcm', '.dicom', '.mha', '.mhd']
    # CT formats  
    ct_extensions = ['.nii.gz', '.nii', '.dcm', '.dicom', '.mha', '.mhd']
    # X-ray formats
    xray_extensions = ['.dcm', '.dicom', '.jpg', '.jpeg', '.png', '.tiff', '.tif']
    
    if modality.upper() == "MRI":
        supported_extensions = mri_extensions
    elif modality.upper() == "CT":
        supported_extensions = ct_extensions
    elif modality.upper() == "XRAY":
        supported_extensions = xray_extensions
    else:
        return False
        
    return any(filename.lower().endswith(ext) for ext in supported_extensions)

@router.post("/", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    scan_date: str = Form(...),
    scan_type: str = Form(...),
    modality: str = Form(...),
    body_part: str = Form(...),
    db: Session = Depends(get_db)
):
    """Upload a medical scan for any supported modality (MRI, CT, X-ray)"""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided"
        )
    
    # Validate modality
    valid_modalities = ["MRI", "CT", "XRAY"]
    if modality.upper() not in valid_modalities:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported modality. Supported modalities: {', '.join(valid_modalities)}"
        )
    
    # Validate file format for the modality
    if not validate_medical_file(file.filename, modality):
        if modality.upper() == "XRAY":
            detail = "Unsupported file format for X-ray. Supported formats: .dcm, .dicom, .jpg, .jpeg, .png, .tiff, .tif"
        else:
            detail = "Unsupported file format. Supported formats: .nii.gz, .nii, .dcm, .dicom, .mha, .mhd"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )
    
    # Verify patient exists
    patient = db.query(PatientModel).filter(PatientModel.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found"
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    if file.filename.endswith('.nii.gz'):
        file_extension = '.nii.gz'
    
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Parse scan date
    try:
        parsed_scan_date = datetime.fromisoformat(scan_date.replace('Z', '+00:00'))
    except ValueError:
        parsed_scan_date = datetime.utcnow()
    
    # Create scan record
    scan = ScanModel(
        patient_id=patient.id,
        scan_date=parsed_scan_date,
        scan_type=scan_type,
        file_path=file_path,
        file_size=file_size,
        modality=modality.upper(),
        body_part=body_part
    )
    
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    return UploadResponse(
        filename=file.filename,
        status="uploaded",
        scan_id=str(scan.id),
        message=f"{modality} scan uploaded successfully"
    ) 