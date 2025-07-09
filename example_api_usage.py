#!/usr/bin/env python3
"""
Example script demonstrating how to use the histopathology API endpoint.
This shows both direct file analysis and database-based analysis.
"""

import requests
import json
import time

# API base URL
BASE_URL = "http://localhost:8000"

def test_histopathology_api():
    """Test the histopathology analysis API endpoint"""
    
    print("🔬 Testing Histopathology API Endpoint")
    print("=" * 50)
    
    # Test 1: Direct file analysis (recommended for histopathology)
    print("\n📁 Test 1: Direct File Analysis")
    print("-" * 30)
    
    # Note: You would need to upload a histopathology image first
    # For this example, we'll use a hypothetical filename
    filename = "histo_sample.jpg"
    modality = "histopath"
    
    url = f"{BASE_URL}/api/v1/analyze/"
    params = {
        "filename": filename,
        "modality": modality
    }
    
    try:
        print(f"🌐 Making request to: {url}")
        print(f"📋 Parameters: {params}")
        
        response = requests.get(url, params=params)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Analysis successful!")
            print(f"🎯 Model: {result.get('model_name', 'Unknown')}")
            print(f"📈 Confidence: {result.get('confidence_score', 0):.3f}")
            
            details = result.get('analysis_details', {})
            print(f"🔬 Predicted Class: {details.get('predicted_class', 'Unknown')}")
            print(f"⚠️  Is Malignant: {details.get('is_malignant', False)}")
            print(f"⏱️  Processing Time: {result.get('processing_time_seconds', 0):.3f}s")
            
            # Show class probabilities
            probabilities = details.get('class_probabilities', {})
            if probabilities:
                print("📊 Class Probabilities:")
                for class_name, prob in probabilities.items():
                    print(f"   {class_name}: {prob:.3f}")
                    
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"📝 Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the backend server is running")
        print("💡 Start the server with: cd backend && uvicorn app.main:app --reload")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")

def test_upload_and_analyze():
    """Example of uploading a file and then analyzing it"""
    
    print("\n📤 Test 2: Upload and Analyze Workflow")
    print("-" * 40)
    
    # Step 1: Upload a file
    print("📤 Step 1: Uploading file...")
    
    upload_url = f"{BASE_URL}/api/v1/upload/"
    
    # Example file data (you would use a real histopathology image)
    files = {
        'file': ('histo_sample.jpg', open('sample_xray.jpg', 'rb'), 'image/jpeg')
    }
    
    data = {
        'patient_id': 'test-patient-123',
        'modality': 'HISTOPATH',
        'body_part': 'Breast',
        'scan_type': 'Histopathology'
    }
    
    try:
        response = requests.post(upload_url, files=files, data=data)
        
        if response.status_code == 200:
            upload_result = response.json()
            scan_id = upload_result.get('scan_id')
            print(f"✅ File uploaded successfully! Scan ID: {scan_id}")
            
            # Step 2: Analyze the uploaded scan
            print("🔬 Step 2: Analyzing uploaded scan...")
            
            analyze_url = f"{BASE_URL}/api/v1/analyze/"
            params = {"scan_id": scan_id}
            
            response = requests.get(analyze_url, params=params)
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Analysis completed!")
                print(f"🎯 Predicted Class: {result.get('analysis_details', {}).get('predicted_class', 'Unknown')}")
                print(f"📈 Confidence: {result.get('confidence_score', 0):.3f}")
            else:
                print(f"❌ Analysis failed: {response.status_code}")
                print(f"📝 Response: {response.text}")
                
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"📝 Response: {response.text}")
            
    except FileNotFoundError:
        print("❌ Sample file not found. Using example data...")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def show_api_documentation():
    """Show API documentation and usage examples"""
    
    print("\n📚 API Documentation")
    print("=" * 30)
    
    print("""
🔬 Histopathology Analysis Endpoints:

1. Direct File Analysis (Recommended):
   GET /api/v1/analyze/?filename=<filename>&modality=histopath
   
   Example:
   curl "http://localhost:8000/api/v1/analyze/?filename=histo_image.jpg&modality=histopath"

2. Database-based Analysis:
   GET /api/v1/analyze/?scan_id=<uuid>
   
   Example:
   curl "http://localhost:8000/api/v1/analyze/?scan_id=123e4567-e89b-12d3-a456-426614174000"

3. Upload File:
   POST /api/v1/upload/
   
   Example:
   curl -X POST "http://localhost:8000/api/v1/upload/" \\
        -F "file=@histo_image.jpg" \\
        -F "patient_id=patient123" \\
        -F "modality=HISTOPATH" \\
        -F "body_part=Breast"

📊 Response Format:
{
  "model_name": "BreastCancerCNN",
  "confidence_score": 0.92,
  "analysis_details": {
    "predicted_class": "Benign",
    "is_malignant": false,
    "class_probabilities": {
      "Normal": 0.05,
      "Benign": 0.92,
      "In Situ Carcinoma": 0.02,
      "Invasive Carcinoma": 0.01
    }
  }
}

🏷️  Supported Classes:
- Normal: Healthy breast tissue
- Benign: Non-cancerous abnormal tissue  
- In Situ Carcinoma: Early-stage cancer
- Invasive Carcinoma: Cancer that has spread

📁 Supported Image Formats:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- BMP (.bmp)
- TIFF (.tiff, .tif)
""")

if __name__ == "__main__":
    print("🏥 Cancer Monitoring Platform - Histopathology API Examples")
    print("=" * 60)
    
    # Show documentation
    show_api_documentation()
    
    # Test API endpoints
    test_histopathology_api()
    test_upload_and_analyze()
    
    print("\n" + "=" * 60)
    print("✅ API examples completed!")
    print("💡 Make sure to start the backend server before testing:")
    print("   cd backend && uvicorn app.main:app --reload") 