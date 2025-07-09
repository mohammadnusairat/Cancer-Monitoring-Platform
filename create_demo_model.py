#!/usr/bin/env python3
"""
Script to create a demonstration PyTorch model for histopathology classification.
This creates a simple pretrained model for testing purposes.
"""

import torch
import torch.nn as nn
import os
import sys

# Add backend to path
sys.path.append('backend')

from app.services.histo_classifier import BreastCancerCNN

def create_demo_model():
    """Create a demonstration model with some pretrained weights"""
    
    print("🔧 Creating Demonstration PyTorch Model")
    print("=" * 50)
    
    # Create models directory if it doesn't exist
    os.makedirs("backend/models", exist_ok=True)
    
    # Initialize the model
    model = BreastCancerCNN(num_classes=4)
    
    # Create some "pretrained" weights (for demonstration)
    # In a real scenario, these would be actual trained weights
    print("📦 Initializing model weights...")
    
    # Initialize weights with Xavier/Glorot initialization
    for module in model.modules():
        if isinstance(module, nn.Conv2d):
            nn.init.xavier_uniform_(module.weight)
            if module.bias is not None:
                nn.init.zeros_(module.bias)
        elif isinstance(module, nn.BatchNorm2d):
            nn.init.ones_(module.weight)
            nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Linear):
            nn.init.xavier_uniform_(module.weight)
            nn.init.zeros_(module.bias)
    
    # Set model to evaluation mode
    model.eval()
    
    # Save the model
    model_path = "backend/models/breast_cancer_cnn.pt"
    torch.save(model.state_dict(), model_path)
    
    print(f"✅ Model saved to: {model_path}")
    print(f"📊 Model size: {os.path.getsize(model_path) / (1024*1024):.2f} MB")
    
    # Test the model
    print("\n🧪 Testing the saved model...")
    
    # Create a test input
    test_input = torch.randn(1, 3, 224, 224)
    
    # Load and test the model
    loaded_model = BreastCancerCNN(num_classes=4)
    loaded_model.load_state_dict(torch.load(model_path))
    loaded_model.eval()
    
    with torch.no_grad():
        output = loaded_model(test_input)
        probabilities = torch.softmax(output, dim=1)
        
        print("✅ Model loaded successfully!")
        print(f"📊 Output shape: {output.shape}")
        print(f"📈 Probabilities sum: {probabilities.sum().item():.6f}")
        
        # Show class probabilities
        class_names = ["Normal", "Benign", "In Situ Carcinoma", "Invasive Carcinoma"]
        for i, (class_name, prob) in enumerate(zip(class_names, probabilities[0])):
            print(f"   {class_name}: {prob.item():.3f}")
    
    print("\n" + "=" * 50)
    print("🎉 Demonstration model created successfully!")
    print("💡 You can now use this model with the histopathology classifier.")
    print("🔬 Test it with: python test_histo_classifier.py")

def convert_keras_to_pytorch_info():
    """Provide information about converting Keras model to PyTorch"""
    
    print("\n📚 Keras to PyTorch Conversion Information")
    print("=" * 50)
    
    print("""
The original repository uses Keras/TensorFlow, but our implementation uses PyTorch.
Here are your options for using the pretrained model:

1. 🎯 Use the demonstration model (recommended for testing):
   - Run this script to create a demo PyTorch model
   - This provides a working model for testing the integration

2. 🔄 Convert the Keras model to PyTorch:
   - Requires additional dependencies (tensorflow, onnx, onnx2pytorch)
   - More complex but preserves the original training
   - Steps:
     a. Install: pip install tensorflow onnx onnx2pytorch
     b. Convert Keras model to ONNX format
     c. Convert ONNX to PyTorch format

3. 🚀 Train a new PyTorch model:
   - Use the sample images from the original repository
   - Train the BreastCancerCNN architecture from scratch
   - Best for production use

For now, the demonstration model will work perfectly for testing the integration!
""")

if __name__ == "__main__":
    print("🏥 Cancer Monitoring Platform - Model Creation")
    print("=" * 60)
    
    # Show conversion info
    convert_keras_to_pytorch_info()
    
    # Create demo model
    create_demo_model()
    
    print("\n" + "=" * 60)
    print("✅ Model creation completed!")
    print("📁 Check backend/models/ for the created model file.") 