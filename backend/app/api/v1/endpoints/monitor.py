from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.db.database import get_db
from app.db.models import Patient as PatientModel, Scan as ScanModel, Segmentation as SegmentationModel, MonitoringAlert as AlertModel
from app.core.schemas import PatientDashboard, Scan as ScanSchema, MonitoringAlert

router = APIRouter()

def calculate_tumor_trend(patient_id: str, db: Session) -> List[Dict[str, Any]]:
    """Calculate tumor volume trend over time for a patient"""
    # Get all scans with segmentations for the patient
    scans_with_seg = db.query(ScanModel, SegmentationModel).join(
        SegmentationModel, ScanModel.id == SegmentationModel.scan_id
    ).filter(ScanModel.patient_id == patient_id).order_by(ScanModel.scan_date).all()
    
    trend_data = []
    for scan, seg in scans_with_seg:
        trend_data.append({
            "scan_date": scan.scan_date.isoformat(),
            "scan_id": scan.id,
            "tumor_volume_cc": seg.tumor_volume_cc,
            "tumor_volume_mm3": seg.tumor_volume_mm3,
            "confidence_score": seg.confidence_score,
            "scan_type": scan.scan_type
        })
    
    return trend_data

def check_for_alerts(patient_id: str, db: Session) -> List[Dict[str, Any]]:
    """Check for potential alerts based on tumor trends"""
    # Get recent segmentations (last 3 months)
    three_months_ago = datetime.utcnow() - timedelta(days=90)
    
    recent_scans = db.query(ScanModel, SegmentationModel).join(
        SegmentationModel, ScanModel.id == SegmentationModel.scan_id
    ).filter(
        ScanModel.patient_id == patient_id,
        ScanModel.scan_date >= three_months_ago
    ).order_by(ScanModel.scan_date).all()
    
    alerts = []
    
    if len(recent_scans) >= 2:
        # Calculate growth rate
        volumes = [seg.tumor_volume_cc for _, seg in recent_scans]
        dates = [scan.scan_date for scan, _ in recent_scans]
        
        # Calculate growth rate (cc per month)
        if len(volumes) >= 2:
            time_diff = (dates[-1] - dates[0]).days / 30.0  # months
            volume_diff = volumes[-1] - volumes[0]
            growth_rate = volume_diff / time_diff if time_diff > 0 else 0
            
            # Check for rapid growth (>10% per month)
            if growth_rate > 0.1 * volumes[0]:
                alerts.append({
                    "type": "rapid_growth",
                    "severity": "high",
                    "message": f"Rapid tumor growth detected: {growth_rate:.2f} cc/month",
                    "growth_rate": growth_rate
                })
            
            # Check for significant growth (>5% per month)
            elif growth_rate > 0.05 * volumes[0]:
                alerts.append({
                    "type": "moderate_growth",
                    "severity": "medium",
                    "message": f"Moderate tumor growth detected: {growth_rate:.2f} cc/month",
                    "growth_rate": growth_rate
                })
    
    return alerts

@router.get("/patient/{patient_id}/dashboard", response_model=PatientDashboard)
async def get_patient_dashboard(patient_id: str, db: Session = Depends(get_db)):
    """Get comprehensive dashboard data for a patient"""
    # Get patient
    patient = db.query(PatientModel).filter(PatientModel.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found"
        )
    
    # Get all scans for the patient
    scans = db.query(ScanModel).filter(ScanModel.patient_id == patient.id).order_by(desc(ScanModel.scan_date)).all()
    
    # Get latest segmentation
    latest_segmentation = None
    if scans:
        latest_scan = scans[0]
        latest_segmentation = db.query(SegmentationModel).filter(
            SegmentationModel.scan_id == latest_scan.id
        ).first()
    
    # Get active alerts
    alerts = db.query(AlertModel).filter(
        AlertModel.patient_id == patient.id,
        AlertModel.is_resolved == False
    ).order_by(desc(AlertModel.created_at)).all()
    
    # Calculate tumor trend
    tumor_trend = calculate_tumor_trend(patient_id, db)
    
    return PatientDashboard(
        patient=patient,
        scans=[ScanSchema.model_validate(scan) for scan in scans],
        latest_segmentation=latest_segmentation,
        alerts=[MonitoringAlert.model_validate(alert) for alert in alerts],
        tumor_trend=tumor_trend
    )

@router.get("/patient/{patient_id}/trend")
async def get_tumor_trend(patient_id: str, db: Session = Depends(get_db)):
    """Get tumor volume trend over time"""
    patient = db.query(PatientModel).filter(PatientModel.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found"
        )
    
    trend_data = calculate_tumor_trend(patient_id, db)
    return {"trend_data": trend_data}

@router.get("/patient/{patient_id}/alerts")
async def get_patient_alerts(patient_id: str, db: Session = Depends(get_db)):
    """Get all alerts for a patient"""
    patient = db.query(PatientModel).filter(PatientModel.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found"
        )
    
    alerts = db.query(AlertModel).filter(AlertModel.patient_id == patient.id).order_by(desc(AlertModel.created_at)).all()
    return {"alerts": alerts}

@router.post("/patient/{patient_id}/check-alerts")
async def check_patient_alerts(patient_id: str, db: Session = Depends(get_db)):
    """Manually check for new alerts for a patient"""
    patient = db.query(PatientModel).filter(PatientModel.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found"
        )
    
    # Check for new alerts
    new_alerts = check_for_alerts(patient_id, db)
    
    # Create alert records in database
    created_alerts = []
    for alert_data in new_alerts:
        # Check if similar alert already exists
        existing_alert = db.query(AlertModel).filter(
            AlertModel.patient_id == patient.id,
            AlertModel.alert_type == alert_data["type"],
            AlertModel.is_resolved == False
        ).first()
        
        if not existing_alert:
            alert = AlertModel(
                patient_id=patient.id,
                alert_type=alert_data["type"],
                severity=alert_data["severity"],
                message=alert_data["message"]
            )
            db.add(alert)
            created_alerts.append(alert)
    
    db.commit()
    
    return {
        "message": f"Found {len(new_alerts)} potential alerts, created {len(created_alerts)} new alerts",
        "new_alerts": new_alerts,
        "created_alerts": [{"id": alert.id, "type": alert.alert_type, "severity": alert.severity} for alert in created_alerts]
    }

@router.put("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str, db: Session = Depends(get_db)):
    """Mark an alert as resolved"""
    alert = db.query(AlertModel).filter(AlertModel.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID {alert_id} not found"
        )
    # Ensure alert is ORM model, not Pydantic schema
    alert.is_resolved = True
    alert.resolved_at = datetime.utcnow()
    db.commit()
    return {"message": "Alert resolved successfully"} 