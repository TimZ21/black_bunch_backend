# This script trains and evaluates a YOLOv8 Small
# It configures training parameters such as dataset path, model version, epochs, batch size, and image size,
# and performs training and validation directly via the YOLO API with GPU support, dataset caching, and custom output paths.
# Evaluation includes printing metrics and confusion matrix.

import os
import torch
import subprocess
import sys
from ultralytics import YOLO

# Silence GitPython warnings/errors if Git is not available
os.environ['GIT_PYTHON_REFRESH'] = 'quiet'
# Set CUDA module loading to lazy to prevent DLL initialization issues
os.environ["CUDA_MODULE_LOADING"] = "LAZY"

# Define training parameters
data_yaml = r"D:\UniDoc\y2s1\SEGP\dataset\script_testing\yolo_dataset_splited\data.yaml"  # Path to the dataset configuration file
model = 'yolov8s.pt'  # YOLOv8 Small pre-trained model
epochs = 150  # Number of epochs for training
batch = 16  # Corrected argument for batch size
imgsz = 640  # Image size
project_name = 'yolov8_training_project_small'  # Name of the project for saving results
weights_path = f'{project_name}/weights/best.pt'  # Path to save the best weights

# Function to train YOLOv8 model using the ultralytics library
def train_yolov8():
    model = YOLO('yolov8s.pt')  # Load the YOLOv8 Small pre-trained model

    # Train the model
    model.train(
        data=data_yaml,  # Path to the dataset.yaml file
        epochs=epochs,  # Number of epochs for training
        batch=batch,  # Batch size (corrected from 'batch_size' to 'batch')
        imgsz=imgsz,  # Image size
        device='0' if torch.cuda.is_available() else 'cpu',  # Use GPU if available
        workers=2,  # Number of data loader workers
        project=project_name,  # Project name for saving results
        name='custom_model',  # Name for the experiment
        exist_ok=True,  # Allow overwriting of previous results
        cache=True,  # Cache dataset for faster training
    )

# Function to evaluate YOLOv8 model using the ultralytics library
def evaluate_yolov8():
    # Check if 'best.pt' or 'last.pt' exists
    best_weights_path = f'{project_name}/runs/train/custom_model/weights/best.pt'
    last_weights_path = f'{project_name}/runs/train/custom_model/weights/last.pt'

    if os.path.exists(best_weights_path):
        weights_file = 'best.pt'
    elif os.path.exists(last_weights_path):
        weights_file = 'last.pt'
    else:
        print("Error: No weights file found for evaluation (neither 'best.pt' nor 'last.pt').")
        return  # Skip evaluation if no weights are available

    # Load the model for evaluation
    model = YOLO(f'{project_name}/runs/train/custom_model/weights/{weights_file}')

    # Evaluate the model
    results = model.val(data=data_yaml, imgsz=imgsz, batch=batch, device='0' if torch.cuda.is_available() else 'cpu')

    # Print the evaluation results
    print("Evaluation Results:")
    print(results)

    # Access the confusion matrix
    conf_matrix = results.confusion_matrix
    print("Confusion Matrix:")
    print(conf_matrix)

if __name__ == '__main__':
    # Add git safe directory configuration
    os.system('git config --global --add safe.directory D:/UniDoc/y2s1/SEGP/yolov5')

    # Check if GPU is available
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Using device: {device}")

    # Train YOLOv8
    train_yolov8()

    # Evaluate YOLOv8
    evaluate_yolov8()

    print("Training and evaluation completed!")
 