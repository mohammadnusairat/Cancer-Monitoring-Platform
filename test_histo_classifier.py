#!/usr/bin/env python3
"""
Test script for the histopathology classifier integration.
This script demonstrates how to use the breast cancer detection CNN model.
"""

import os
import sys
import time
from pathlib import Path

# Add backend to path
sys.path.append('backend')

from app.services.histo_classifier import HistoClassifier

def test_histo_classifier():
    """Test the histopathology classifier with sample images"""
    
    print("🏥 Testing Histopathology Classifier")
    print("=" * 50)
    
    # Initialize classifier
    print("📦 Initializing classifier...")
    classifier = HistoClassifier()
    print(f"✅ Classifier initialized with model: {classifier.model_name}")
    print(f"📊 Device: {classifier.device}")
    print(f"🏷️  Classes: {classifier.class_names}")
    
    # Test with sample images
    sample_images = [
        "histo_normal.jpg",    # Normal histopathology image
        "histo_benign.jpg",   # Benign histopathology image
        "histo_insitu.jpg",   # In Situ histopathology image
        "histo_invasive.jpg", # Invasive histopathology image
        "sample_xray.jpg"     # Sample xray image (to be added)
    ]
    
    for image_file in sample_images:
        print(f"\n🔍 Testing with: {image_file}")
        print("-" * 30)
        
        try:
            # Run analysis
            start_time = time.time()
            result = classifier.run(image_file)
            end_time = time.time()
            
            print(f"⏱️  Processing time: {result['processing_time_seconds']:.3f}s")
            print(f"🎯 Predicted class: {result['analysis_details']['predicted_class']}")
            print(f"📈 Confidence: {result['confidence_score']:.3f}")
            print(f"🔬 Is malignant: {result['analysis_details']['is_malignant']}")
            
            print("📊 Class probabilities:")
            for class_name, prob in result['analysis_details']['class_probabilities'].items():
                print(f"   {class_name}: {prob:.3f}")
            
            print(f"📁 Mask path: {result['mask_path']}")
            
        except Exception as e:
            print(f"❌ Error processing {image_file}: {str(e)}")
    
    print("\n" + "=" * 50)
    print("✅ Test completed!")

def test_direct_analysis():
    """Test direct file analysis"""
    
    print("\n🔬 Testing Direct File Analysis")
    print("=" * 50)
    
    classifier = HistoClassifier()
    
    # Test with a sample image
    sample_file = "data/uploads/histo_normal.jpg"
    if os.path.exists(sample_file):
        print(f"📁 Analyzing: {sample_file}")
        
        try:
            result = classifier.analyze(sample_file, "Breast")
            
            print(f"✅ Analysis successful!")
            print(f"🎯 Class: {result['analysis_details']['predicted_class']}")
            print(f"📈 Confidence: {result['confidence_score']:.3f}")
            print(f"🔬 Malignant: {result['analysis_details']['is_malignant']}")
            
        except Exception as e:
            print(f"❌ Analysis failed: {str(e)}")
    else:
        print(f"⚠️  Sample file {sample_file} not found")

if __name__ == "__main__":
    test_histo_classifier()
    test_direct_analysis() 