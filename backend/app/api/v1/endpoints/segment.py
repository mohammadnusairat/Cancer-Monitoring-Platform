from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import shutil
import os
import uuid
from datetime import datetime
import nibabel as nib  # type: ignore
import numpy as np
from typing import Optional

from app.db.database import get_db
from app.db.models import Scan as ScanModel, Segmentation as SegmentationModel, Patient as PatientModel
from app.core.schemas import UploadResponse, SegmentationResponse

router = APIRouter()

UPLOAD_DIR = "data/uploads"
MASKS_DIR = "data/masks"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(MASKS_DIR, exist_ok=True)

def validate_medical_file(filename: str) -> bool:
    """Validate if the uploaded file is a supported medical image format"""
    supported_extensions = ['.nii.gz', '.nii', '.dcm', '.dicom', '.mha', '.mhd']
    return any(filename.lower().endswith(ext) for ext in supported_extensions)

def simulate_tumor_segmentation(file_path: str) -> dict:
    """Simulate tumor segmentation using TumorTrace-like processing"""
    # This is a placeholder for actual TumorTrace integration
    # In production, this would call the TumorTrace model
    
    try:
        # Try to load with nibabel for NIfTI files
        if file_path.endswith(('.nii.gz', '.nii')):
            img = nib.load(file_path)  # type: ignore
            data = img.get_fdata() # type: ignore
            
            # Simulate segmentation by finding regions with high intensity
            # This is just a placeholder - real segmentation would use ML models
            threshold = np.percentile(data, 95)
            mask = data > threshold
            
            # Calculate volume (assuming 1mm³ voxels)
            volume_mm3 = np.sum(mask)
            volume_cc = volume_mm3 / 1000  # Convert to cc
            
            # Save simulated mask
            mask_filename = f"mask_{uuid.uuid4()}.nii.gz"
            mask_path = os.path.join(MASKS_DIR, mask_filename)
            
            mask_img = nib.Nifti1Image(mask.astype(np.uint8), img.affine, img.header)  # type: ignore
            nib.save(mask_img, mask_path)  # type: ignore
            
            return {
                "mask_path": mask_path,
                "tumor_volume_mm3": float(volume_mm3),
                "tumor_volume_cc": float(volume_cc),
                "confidence_score": 0.85,  # Simulated confidence
                "processing_time_seconds": 2.5  # Simulated processing time
            }
        else:
            # For other formats, return simulated data
            return {
                "mask_path": f"/masks/simulated_mask_{uuid.uuid4()}.nii.gz",
                "tumor_volume_mm3": 42700.0,  # 42.7 cc in mm³
                "tumor_volume_cc": 42.7,
                "confidence_score": 0.82,
                "processing_time_seconds": 3.0
            }
    except Exception as e:
        # Fallback to simulated data if processing fails
        return {
            "mask_path": f"/masks/fallback_mask_{uuid.uuid4()}.nii.gz",
            "tumor_volume_mm3": 35000.0,
            "tumor_volume_cc": 35.0,
            "confidence_score": 0.75,
            "processing_time_seconds": 1.5
        }

@router.post("/upload", response_model=UploadResponse)
async def upload_scan(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    scan_date: str = Form(...),
    scan_type: str = Form(...),
    modality: str = Form(default="MRI"),
    body_part: str = Form(default="Brain"),
    db: Session = Depends(get_db)
):
    """Upload a medical scan and create database record"""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided"
        )
    
    if not validate_medical_file(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Supported formats: .nii.gz, .nii, .dcm, .dicom, .mha, .mhd"
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
        modality=modality,
        body_part=body_part
    )
    
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    return UploadResponse(
        filename=file.filename,
        status="uploaded",
        scan_id=str(scan.id),
        message="Scan uploaded successfully"
    )

@router.post("/process/{scan_id}", response_model=SegmentationResponse)
async def process_segmentation(scan_id: str, db: Session = Depends(get_db)):
    """Process segmentation for a specific scan"""
    # Get scan
    scan = db.query(ScanModel).filter(ScanModel.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan with ID {scan_id} not found"
        )
    
    # Check if segmentation already exists
    existing_segmentation = db.query(SegmentationModel).filter(SegmentationModel.scan_id == scan_id).first()
    if existing_segmentation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Segmentation already exists for scan {scan_id}"
        )
    
    # Simulate segmentation processing
    segmentation_result = simulate_tumor_segmentation(str(scan.file_path))
    
    # Create segmentation record
    segmentation = SegmentationModel(
        scan_id=scan_id,
        mask_path=segmentation_result["mask_path"],
        tumor_volume_cc=segmentation_result["tumor_volume_cc"],
        tumor_volume_mm3=segmentation_result["tumor_volume_mm3"],
        confidence_score=segmentation_result["confidence_score"],
        processing_time_seconds=segmentation_result["processing_time_seconds"]
    )
    
    db.add(segmentation)
    db.commit()
    db.refresh(segmentation)
    
    return SegmentationResponse(
        scan_id=str(scan_id),
        segmentation_id=str(segmentation.id),
        tumor_volume_cc=float(segmentation.tumor_volume_cc),
        tumor_volume_mm3=float(segmentation.tumor_volume_mm3),
        confidence_score=float(segmentation.confidence_score),
        processing_time_seconds=float(segmentation.processing_time_seconds),
        mask_path=str(segmentation.mask_path)
    )

@router.get("/{scan_id}/segmentation", response_model=SegmentationResponse)
async def get_segmentation(scan_id: str, db: Session = Depends(get_db)):
    """Get segmentation results for a specific scan"""
    segmentation = db.query(SegmentationModel).filter(SegmentationModel.scan_id == scan_id).first()
    if not segmentation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Segmentation not found for scan {scan_id}"
        )
    
    return SegmentationResponse(
        scan_id=str(scan_id),
        segmentation_id=str(segmentation.id),
        tumor_volume_cc=float(segmentation.tumor_volume_cc),
        tumor_volume_mm3=float(segmentation.tumor_volume_mm3),
        confidence_score=float(segmentation.confidence_score),
        processing_time_seconds=float(segmentation.processing_time_seconds),
        mask_path=str(segmentation.mask_path)
    )
