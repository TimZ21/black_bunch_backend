# This script generates COCO-format annotation JSON from a YOLO dataset.
# It reads images and their corresponding YOLO label files, extracts image metadata, converts bounding box coordinates 
# from YOLO normalized format to absolute pixel values, and structures them in the COCO dataset format.

import os
import json
from PIL import Image

# Paths to your dataset
images_folder = r"D:\UniDoc\y2s1\SEGP\dataset\yolo_dataset_splited\images\val"
labels_folder = r"D:\UniDoc\y2s1\SEGP\dataset\yolo_dataset_splited\labels\val"
output_json = "val_annotations.json"

# Category information (you need to provide the class names)
categories = [
    {"id": 0, "name": "_background_"},
    {"id": 1, "name": "Black Bunch"},
    # Add more classes as needed
]

# Initialize COCO structure
coco_format = {
    "images": [],
    "annotations": [],
    "categories": categories,
}

annotation_id = 0

# Loop through all images and annotations
for filename in os.listdir(images_folder):
    if filename.endswith(('.jpg', '.png', '.jpeg')):
        image_path = os.path.join(images_folder, filename)
        label_path = os.path.join(labels_folder, os.path.splitext(filename)[0] + ".txt")

        # Load the image to get its dimensions
        with Image.open(image_path) as img:
            width, height = img.size

        # Add image info to COCO JSON
        image_id = len(coco_format["images"]) + 1
        coco_format["images"].append({
            "id": image_id,
            "file_name": filename,
            "width": width,
            "height": height
        })

        # Read the corresponding YOLO label file
        if os.path.exists(label_path):
            with open(label_path, "r") as file:
                for line in file:
                    class_id, x_center, y_center, box_width, box_height = map(float, line.strip().split())

                    # Convert normalized YOLO coordinates to absolute COCO format
                    x_center_abs = x_center * width
                    y_center_abs = y_center * height
                    box_width_abs = box_width * width
                    box_height_abs = box_height * height

                    # Convert YOLO format to COCO format [xmin, ymin, width, height]
                    xmin = x_center_abs - (box_width_abs / 2)
                    ymin = y_center_abs - (box_height_abs / 2)

                    # Create annotation entry
                    annotation = {
                        "id": annotation_id,
                        "image_id": image_id,
                        "category_id": int(class_id),
                        "bbox": [xmin, ymin, box_width_abs, box_height_abs],
                        "area": box_width_abs * box_height_abs,
                        "iscrowd": 0
                    }
                    coco_format["annotations"].append(annotation)
                    annotation_id += 1

# Save to COCO JSON file
with open(output_json, "w") as json_file:
    json.dump(coco_format, json_file, indent=4)

print(f"COCO format annotations saved to {output_json}")
