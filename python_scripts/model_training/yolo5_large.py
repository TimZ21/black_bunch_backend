# Author: Zhang Shuning
# This script trains and evaluates a YOLOv5 Large
# It configures training parameters such as dataset path, model version (YOLOv5l.pt), number of epochs, batch size, and image size.
# The script uses subprocess to run YOLOv5's train.py and val.py scripts, enables GPU acceleration, dataset caching, and mixed-precision inference for efficiency.

import os
import torch
import subprocess
import sys

# Silence GitPython warnings/errors if Git is not available
os.environ['GIT_PYTHON_REFRESH'] = 'quiet'
# Set CUDA module loading to lazy to prevent DLL initialization issues
os.environ["CUDA_MODULE_LOADING"] = "LAZY"

# Define training parameters
data_yaml = r"D:\UniDoc\y2s1\SEGP\dataset\script_testing\yolo_dataset_splited\data.yaml"  # Path to the dataset configuration file
model = 'yolov5l.pt'  # YOLOv5 Large pre-trained model
epochs = 200  # Number of epochs for training
batch_size = 8  # Set batch size based on GPU memory capacity
img_size = 640  # Increase image size for better performance
project_name = 'yolov5_training_project_large'  # Name of the project for saving results
weights_path = f'{project_name}/weights/best.pt'  # Path to save the best weights

# Function to train YOLOv5 model using CLI
def train_yolov5():
    command = [
        sys.executable, 'train.py',  # Use sys.executable to ensure the current Python environment is used
        '--img', str(img_size),
        '--batch-size', str(batch_size),  # Corrected from '--batch' to '--batch-size'
        '--epochs', str(epochs),
        '--data', data_yaml,
        '--weights', model,
        '--project', project_name,
        '--device', '0' if torch.cuda.is_available() else 'cpu',  # Ensure GPU is used if available
        '--cache',  # Cache dataset for faster training
        '--workers', '2',  # Set number of data loader workers based on system capabilities
    ]
    subprocess.run(command)

# Function to evaluate YOLOv5 model using CLI
def evaluate_yolov5():
    # Check if 'best.pt' or 'last.pt' exists
    best_weights_path = f'{project_name}/weights/best.pt'
    last_weights_path = f'{project_name}/weights/last.pt'

    if os.path.exists(best_weights_path):
        weights_file = 'best.pt'
    elif os.path.exists(last_weights_path):
        weights_file = 'last.pt'
    else:
        print("Error: No weights file found for evaluation (neither 'best.pt' nor 'last.pt').")
        return  # Skip evaluation if no weights are available

    command = [
        sys.executable, 'val.py',  # Use sys.executable to ensure the current Python environment is used
        '--weights', f'{project_name}/weights/{weights_file}',
        '--data', data_yaml,
        '--img', str(img_size),
        '--batch-size', str(batch_size),  # Corrected from '--batch' to '--batch-size'
        '--device', '0' if torch.cuda.is_available() else 'cpu',
        '--half'  # Enable mixed precision during validation
    ]
    subprocess.run(command)

if __name__ == '__main__':
    # Add git safe directory configuration (optional)
    os.system('git config --global --add safe.directory D:/UniDoc/y2s1/SEGP/yolov5')

    # Check if GPU is available
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Using device: {device}")

    # Train YOLOv5
    train_yolov5()

    # Evaluate YOLOv5
    evaluate_yolov5()

    print("Training and evaluation completed!")