# Author: Zhang Shuning
# Used to check the COCO-format annotation
# This script visualizes COCO-format annotations by loading an image and its corresponding bounding box annotations.
# It reads the JSON annotation file, maps image filenames to their IDs, and plots the selected image with bounding boxes 
# and class labels overlaid using matplotlib. The user can specify which image to display by entering its filename.

import json
import os
import cv2
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Path to the COCO annotations file and images directory
coco_annotation_path = r"D:\UniDoc\y2s1\SEGP\dataset\COCO_dataset\annotations\train_annotations.json"
images_directory = r"D:\UniDoc\y2s1\SEGP\dataset\COCO_dataset\images\train"

# Load the COCO annotations
with open(coco_annotation_path, 'r') as f:
    coco_data = json.load(f)

# Create dictionaries for easy lookup
images_dict = {image['id']: image for image in coco_data['images']}
annotations_dict = {}
for ann in coco_data['annotations']:
    image_id = ann['image_id']
    if image_id not in annotations_dict:
        annotations_dict[image_id] = []
    annotations_dict[image_id].append(ann)

# Create a dictionary to lookup image IDs by file name
file_name_to_id = {image['file_name']: image['id'] for image in coco_data['images']}

# Function to plot the specific image with annotations
def plot_specific_image(filename):
    if filename not in file_name_to_id:
        print(f"Image '{filename}' not found in annotations.")
        return

    image_id = file_name_to_id[filename]
    image_info = images_dict[image_id]

    # Load the image
    image_path = os.path.join(images_directory, image_info['file_name'])
    image = cv2.imread(image_path)
    if image is None:
        print(f"Could not read image: {image_path}")
        return

    # Convert BGR image (OpenCV default) to RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Plot the image using Matplotlib
    fig, ax = plt.subplots(1)
    ax.imshow(image)

    # Check if there are annotations for this image
    if image_id in annotations_dict:
        for ann in annotations_dict[image_id]:
            # Extract bounding box information
            bbox = ann['bbox']
            x, y, width, height = bbox

            # Create a rectangle patch and add it to the axes
            rect = patches.Rectangle((x, y), width, height, linewidth=2, edgecolor='r', facecolor='none')
            ax.add_patch(rect)

            # Optionally, add category label (if available)
            category_id = ann['category_id']
            category_name = next((cat['name'] for cat in coco_data['categories'] if cat['id'] == category_id), "unknown")
            plt.text(x, y - 10, category_name, color='red', fontsize=10, bbox=dict(facecolor='white', alpha=0.5))

    # Set title and remove axis
    plt.title(f"Image: {filename}")
    plt.axis('off')
    plt.show()

# Input to specify which image to display
filename = input("Enter the image filename you want to display (including extension, e.g., 'example.jpg'): ")
plot_specific_image(filename)
