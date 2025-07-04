From a user perspective, this Cancer Monitoring Platform is a web application designed to help clinicians and researchers manage, monitor, and analyze cancer patient data—especially for brain tumor cases. Here’s what can be done with it:

---

### **Key Features & User Actions**

#### 1. **Dashboard Overview**
- **See a summary** of all patients, total scans, active alerts, and recent segmentations.
- **Visualize trends** such as tumor volume changes and scan type distributions with interactive charts.

#### 2. **Patient Management**
- **View a list of all patients** with key details (name, age, gender, diagnosis, etc.).
- **Search and filter** patients by name, ID, or diagnosis.
- **Add new patients** (if enabled).
- **Edit or delete patient records** (if enabled).

#### 3. **Patient Detail View**
- **See detailed information** for each patient, including demographics and diagnosis.
- **View all scans** associated with a patient.
- **Track tumor volume trends** over time for longitudinal monitoring.
- **See alerts** for rapid tumor growth or other concerning trends.
- **Download or view segmentation results** for each scan.

#### 4. **Upload Medical Scans**
- **Upload new MRI or other medical scans** for a patient (supports NIfTI, DICOM, MetaImage formats).
- **Process scans** to simulate tumor segmentation (in production, this would use an AI model).
- **View segmentation results** including tumor volume and confidence scores.

#### 5. **Alerts & Monitoring**
- **Receive automated alerts** if a patient’s tumor is growing rapidly or other thresholds are crossed.
- **Review alert history** for each patient.

#### 6. **Quick Actions**
- **Navigate easily** to upload scans, view all patients, or generate reports from the dashboard.

---

### **User Flow Example**
1. **Log in** (if authentication is enabled).
2. **See the dashboard** with a summary of all activity.
3. **Click “Patients”** to view and search the patient list.
4. **Select a patient** to see their details, scan history, and tumor trends.
5. **Upload a new scan** for a patient and process it for segmentation.
6. **Review alerts** and monitor changes in tumor volume over time.

---

### **What You Can’t Do (Current Version)**
- You cannot use real AI segmentation (it’s simulated).
- You do not have real integration with TumorTrace or cancer-sim-search APIs.
- Authentication and user roles may not be enabled by default.

---

**In summary:**  
You can manage patients, upload and process scans, track tumor progression, and get automated alerts—all through a modern, interactive web interface.