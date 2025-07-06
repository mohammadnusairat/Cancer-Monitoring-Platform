from fastapi import APIRouter, Query, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.db.database import get_db
from app.db.models import Scan as ScanModel, Segmentation as SegmentationModel
from app.services.mri_segmenter import MRISegmenter
from app.services.ct_analyzer import CTAnalyzer
from app.services.xray_model import XRayModel

router = APIRouter()

@router.get("/")
async def analyze(
    scan_id: str = Query(...),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Analyze a medical scan using the appropriate ML model based on modality"""
    
    # Get scan
    scan = db.query(ScanModel).filter(ScanModel.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan with ID {scan_id} not found"
        )
    
    # Check if analysis already exists
    existing_segmentation = db.query(SegmentationModel).filter(SegmentationModel.scan_id == scan_id).first()
    if existing_segmentation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Analysis already exists for scan {scan_id}"
        )
    
    # Route to appropriate model based on modality
    modality = scan.modality.upper()
    
    try:
        if modality == "MRI":
            segmenter = MRISegmenter()
            result = segmenter.analyze(str(scan.file_path), str(scan.scan_type))
        elif modality == "CT":
            analyzer = CTAnalyzer()
            result = analyzer.analyze(str(scan.file_path), str(scan.body_part))
        elif modality == "XRAY":
            model = XRayModel()
            result = model.analyze(str(scan.file_path), str(scan.body_part))
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported modality: {modality}"
            )
        
        # Create segmentation record
        segmentation = SegmentationModel(
            scan_id=scan_id,
            mask_path=result.get("mask_path", ""),
            tumor_volume_cc=float(result.get("tumor_volume_cc", 0.0)),
            tumor_volume_mm3=float(result.get("tumor_volume_mm3", 0.0)),
            confidence_score=float(result.get("confidence_score", 0.0)),
            segmentation_method=result.get("model_name", "Unknown"),
            processing_time_seconds=float(result.get("processing_time_seconds", 0.0))
        )
        
        db.add(segmentation)
        db.commit()
        db.refresh(segmentation)
        
        return {
            "scan_id": str(scan_id),
            "modality": modality,
            "segmentation_id": str(segmentation.id),
            "model_name": result.get("model_name", "Unknown"),
            "tumor_volume_cc": float(segmentation.tumor_volume_cc),
            "tumor_volume_mm3": float(segmentation.tumor_volume_mm3),
            "confidence_score": float(segmentation.confidence_score),
            "processing_time_seconds": float(segmentation.processing_time_seconds),
            "mask_path": str(segmentation.mask_path),
            "analysis_details": result.get("analysis_details", {}),
            "status": "completed"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@router.get("/status/{scan_id}")
async def get_analysis_status(
    scan_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get the analysis status for a specific scan"""
    
    scan = db.query(ScanModel).filter(ScanModel.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan with ID {scan_id} not found"
        )
    
    segmentation = db.query(SegmentationModel).filter(SegmentationModel.scan_id == scan_id).first()
    
    if segmentation:
        return {
            "scan_id": str(scan_id),
            "modality": str(scan.modality),
            "status": "completed",
            "segmentation_id": str(segmentation.id),
            "model_name": str(segmentation.segmentation_method),
            "tumor_volume_cc": float(segmentation.tumor_volume_cc),
            "confidence_score": float(segmentation.confidence_score),
            "created_at": segmentation.created_at.isoformat()
        }
    else:
        return {
            "scan_id": str(scan_id),
            "modality": scan.modality,
            "status": "pending",
            "message": "Analysis not yet performed"
        } 