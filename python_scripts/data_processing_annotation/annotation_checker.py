# Author: Zhang Shuning
# Used to check the annotation
# This script visualizes YOLO-format annotations by drawing bounding boxes on corresponding images.
# It reads an image and its associated annotation file, converts the normalized bounding box coordinates 
# from the annotation to pixel values, and displays the image with bounding boxes overlaid using OpenCV and matplotlib.
# The class label 'Black Bunch' is hardcoded for display purposes here.

import os
import cv2
import matplotlib.pyplot as plt
import yaml
from pathlib import Path

# Define paths to images and annotations
images_directory = r'D:\UniDoc\y2s1\SEGP\dataset\script_testing\yolo_dataset_splited\images\val'  # Replace with your images directory
annotations_directory = r'D:\UniDoc\y2s1\SEGP\dataset\script_testing\yolo_dataset_splited\labels\val'  # Replace with your annotations directory

# Function to load annotation file in YOLO format
def load_annotations(annotation_path):
    annotations = []
    with open(annotation_path, 'r') as file:
        for line in file.readlines():
            parts = line.strip().split()
            class_id = int(parts[0])
            x_center = float(parts[1])
            y_center = float(parts[2])
            width = float(parts[3])
            height = float(parts[4])
            annotations.append((class_id, x_center, y_center, width, height))
    return annotations

# Function to draw bounding boxes on the image
def draw_bounding_boxes(image_path, annotations):
    img = cv2.imread(image_path)
    img_height, img_width = img.shape[:2]
    
    for annotation in annotations:
        class_id, x_center, y_center, width, height = annotation
        # Convert YOLO format (relative) to absolute pixel values
        x_min = int((x_center - width / 2) * img_width)
        y_min = int((y_center - height / 2) * img_height)
        x_max = int((x_center + width / 2) * img_width)
        y_max = int((y_center + height / 2) * img_height)
        
        # Draw the bounding box
        color = (255, 255, 0)  # Green color for the box
        thickness = 6
        img = cv2.rectangle(img, (x_min, y_min), (x_max, y_max), color, thickness)
        
        # Put class label
        label = 'Black Bunch'
        cv2.putText(img, label, (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
    
    # Convert BGR to RGB for matplotlib
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    plt.imshow(img_rgb)
    plt.axis('off')
    plt.show()

if __name__ == '__main__':
    # Specify an example image and annotation
    example_image_name = 'net54.jpg'  # Replace with your image name
    image_path = os.path.join(images_directory, example_image_name)
    annotation_path = os.path.join(annotations_directory, Path(example_image_name).stem + '.txt')

    # Load annotations and draw bounding boxes
    if os.path.exists(image_path) and os.path.exists(annotation_path):
        annotations = load_annotations(annotation_path)
        draw_bounding_boxes(image_path, annotations)
    else:
        print(f'Image or annotation not found: {example_image_name}')
