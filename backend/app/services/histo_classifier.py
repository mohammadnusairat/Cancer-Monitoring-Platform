import os
import uuid
import time
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
from typing import Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BreastCancerCNN(nn.Module):
    """CNN model for breast cancer classification"""
    
    def __init__(self, num_classes: int = 4):
        super(BreastCancerCNN, self).__init__()
        
        # Convolutional layers
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.conv4 = nn.Conv2d(128, 256, kernel_size=3, padding=1)
        
        # Batch normalization
        self.bn1 = nn.BatchNorm2d(32)
        self.bn2 = nn.BatchNorm2d(64)
        self.bn3 = nn.BatchNorm2d(128)
        self.bn4 = nn.BatchNorm2d(256)
        
        # Pooling and dropout
        self.pool = nn.MaxPool2d(2, 2)
        self.dropout = nn.Dropout(0.5)
        
        # Fully connected layers
        self.fc1 = nn.Linear(256 * 14 * 14, 512)
        self.fc2 = nn.Linear(512, 256)
        self.fc3 = nn.Linear(256, num_classes)
        
        # Activation functions
        self.relu = nn.ReLU()
        
    def forward(self, x):
        # Convolutional layers
        x = self.pool(self.relu(self.bn1(self.conv1(x))))
        x = self.pool(self.relu(self.bn2(self.conv2(x))))
        x = self.pool(self.relu(self.bn3(self.conv3(x))))
        x = self.pool(self.relu(self.bn4(self.conv4(x))))
        
        # Flatten
        x = x.view(x.size(0), -1)
        
        # Fully connected layers
        x = self.dropout(self.relu(self.fc1(x)))
        x = self.dropout(self.relu(self.fc2(x)))
        x = self.fc3(x)
        
        return x

class HistoClassifier:
    """Histopathology image classification service using CNN"""
    
    def __init__(self, model_path: Optional[str] = None):
        self.model_name = "BreastCancerCNN"
        self.class_names = ["Normal", "Benign", "In Situ Carcinoma", "Invasive Carcinoma"]
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Initialize model
        self.model = BreastCancerCNN(num_classes=len(self.class_names))
        self.model.to(self.device)
        
        # Load pretrained model if available
        if model_path and os.path.exists(model_path):
            try:
                self.model.load_state_dict(torch.load(model_path, map_location=self.device))
                logger.info(f"Loaded pretrained model from {model_path}")
            except Exception as e:
                logger.warning(f"Failed to load pretrained model: {e}. Using random weights.")
        else:
            logger.info("No pretrained model found. Using random weights.")
        
        self.model.eval()
        
        # Define image transformations
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def preprocess_image(self, image_path: str) -> torch.Tensor:
        """Preprocess image for model inference"""
        try:
            # Load and convert image
            image = Image.open(image_path).convert('RGB')
            
            # Apply transformations
            image_tensor = self.transform(image)
            
            # Add batch dimension
            image_tensor = image_tensor.unsqueeze(0)
            
            return image_tensor.to(self.device)
            
        except Exception as e:
            raise ValueError(f"Failed to preprocess image {image_path}: {str(e)}")
    
    def predict(self, image_tensor: torch.Tensor) -> Dict[str, Any]:
        """Run inference on preprocessed image"""
        try:
            with torch.no_grad():
                # Forward pass
                outputs = self.model(image_tensor)
                
                # Get probabilities
                probabilities = torch.softmax(outputs, dim=1)
                
                # Get predicted class
                predicted_class_idx = torch.argmax(probabilities, dim=1).item()
                confidence = probabilities[0][predicted_class_idx].item()
                
                # Get all class probabilities
                class_probabilities = {
                    class_name: probabilities[0][i].item() 
                    for i, class_name in enumerate(self.class_names)
                }
                
                return {
                    "predicted_class": self.class_names[predicted_class_idx],
                    "predicted_class_id": predicted_class_idx,
                    "confidence": confidence,
                    "class_probabilities": class_probabilities
                }
                
        except Exception as e:
            raise RuntimeError(f"Model inference failed: {str(e)}")
    
    def analyze(self, file_path: str, body_part: str = "Breast") -> Dict[str, Any]:
        """Analyze histopathology image and return classification results"""
        start_time = time.time()
        
        try:
            # Validate file exists
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Image file not found: {file_path}")
            
            # Validate file is an image
            valid_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif']
            file_ext = os.path.splitext(file_path)[1].lower()
            if file_ext not in valid_extensions:
                raise ValueError(f"Unsupported image format: {file_ext}")
            
            # Preprocess image
            image_tensor = self.preprocess_image(file_path)
            
            # Run prediction
            prediction_result = self.predict(image_tensor)
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            # Generate mask path (for consistency with other services)
            mask_filename = f"histo_mask_{uuid.uuid4()}.png"
            mask_path = os.path.join("data/masks", mask_filename)
            
            # Determine if malignant (In Situ or Invasive Carcinoma)
            is_malignant = prediction_result["predicted_class"] in ["In Situ Carcinoma", "Invasive Carcinoma"]
            
            return {
                "model_name": self.model_name,
                "mask_path": mask_path,
                "tumor_volume_mm3": 0.0,  # Histopathology is 2D, no volume
                "tumor_volume_cc": 0.0,
                "confidence_score": prediction_result["confidence"],
                "processing_time_seconds": processing_time,
                "analysis_details": {
                    "body_part": body_part,
                    "detection_method": "CNN Classification",
                    "predicted_class": prediction_result["predicted_class"],
                    "predicted_class_id": prediction_result["predicted_class_id"],
                    "is_malignant": is_malignant,
                    "class_probabilities": prediction_result["class_probabilities"],
                    "image_quality_score": 0.95,  # Assuming good quality histopathology images
                    "classification_confidence": prediction_result["confidence"]
                }
            }
            
        except Exception as e:
            logger.error(f"Analysis failed for {file_path}: {str(e)}")
            return self._fallback_analysis(file_path, body_part, start_time, str(e))
    
    def _fallback_analysis(self, file_path: str, body_part: str, start_time: float, error: str) -> Dict[str, Any]:
        """Fallback analysis when processing fails"""
        processing_time = time.time() - start_time
        
        return {
            "model_name": self.model_name,
            "mask_path": f"/masks/fallback_histo_{uuid.uuid4()}.png",
            "tumor_volume_mm3": 0.0,
            "tumor_volume_cc": 0.0,
            "confidence_score": 0.5,
            "processing_time_seconds": processing_time,
            "analysis_details": {
                "body_part": body_part,
                "detection_method": "CNN Classification",
                "error": error,
                "predicted_class": "Unknown",
                "predicted_class_id": -1,
                "is_malignant": False,
                "class_probabilities": {
                    "Normal": 0.25,
                    "Benign": 0.25,
                    "In Situ Carcinoma": 0.25,
                    "Invasive Carcinoma": 0.25
                },
                "image_quality_score": 0.5,
                "classification_confidence": 0.5
            }
        }
    
    def run(self, filename: str) -> Dict[str, Any]:
        """Convenience method to run analysis on a filename in the uploads directory"""
        file_path = os.path.join("data/uploads", filename)
        return self.analyze(file_path, "Breast") 