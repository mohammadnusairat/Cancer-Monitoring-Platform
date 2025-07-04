Here’s how this platform uses [TumorTrace](https://github.com/manumishra12/TumorTrace) for brain tumor segmentation and [cancer-sim-search](https://github.com/ivartz/cancer-sim-search) for longitudinal MRI monitoring, based on your codebase and documentation.

*The code is inspired by the functionality of TumorTrace and cancer-sim-search, but I did not simply copy-paste their actual code or use their APIs.*

---

### TumorTrace for Brain Tumor Segmentation

- **Integration Point:**  
  In the backend (`app/api/v1/endpoints/segment.py`), the function `simulate_tumor_segmentation` is used to process uploaded MRI scans.
- **How it works:**  
  - When a scan is uploaded, the backend saves the file and (in production) would call the TumorTrace model for segmentation.
  - The current code simulates this by thresholding the image to create a mask, but the comments and schema indicate this is a placeholder for TumorTrace.
  - The segmentation result includes:
    - Segmentation mask path
    - Tumor volume (cc and mm³)
    - Confidence score
    - Processing time
    - The segmentation method is labeled as `"TumorTrace"` in the database and API schemas.
- **User Flow:**  
  1. User uploads a scan.
  2. The backend processes the scan (simulating TumorTrace).
  3. The segmentation result is stored and can be retrieved for visualization and analysis.

---

### cancer-sim-search for Longitudinal MRI Monitoring

- **Integration Point:**  
  The backend (`app/api/v1/endpoints/monitor.py`) provides endpoints and logic for longitudinal monitoring.
- **How it works:**  
  - The system tracks tumor volume over time for each patient by aggregating segmentation results from multiple scans.
  - The function `calculate_tumor_trend` computes tumor volume trends (growth, reduction, stability) using the segmentation data.
  - The function `check_for_alerts` analyzes these trends to detect rapid or moderate tumor growth, generating alerts if thresholds are exceeded.
  - This mimics the functionality of cancer-sim-search, which is designed for longitudinal analysis and monitoring.
- **User Flow:**  
  1. Multiple scans and segmentations are associated with a patient.
  2. The backend calculates tumor volume trends and growth rates.
  3. Alerts are generated for significant changes, and the trend data is visualized in the dashboard and patient detail pages.

---

### Summary Table

| Feature                | Tool/Module         | How it’s Used                                                                 |
|------------------------|---------------------|-------------------------------------------------------------------------------|
| Tumor Segmentation     | TumorTrace          | Processes MRI scans, generates segmentation masks, tumor volume, confidence   |
| Longitudinal Monitoring| cancer-sim-search   | Tracks tumor volume over time, calculates growth, triggers alerts             |

---

**Note:**  
- The current code simulates TumorTrace and cancer-sim-search logic, but is structured so you can plug in the real models/APIs.
- The frontend displays segmentation results and tumor trends, leveraging this backend logic.
