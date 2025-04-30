# This code is for converting the polygen annotation to the bounding box format that can be used for yolo model training
# The program will also copy the image without annotaion to the output directory to improve the robustness of the model
# The images will be moved to a specific folder named "iamges"

import os
import shutil
from tqdm import tqdm

# Define directories
input_directory = r'D:\UniDoc\y2s1\SEGP\dataset\images\downloaded_images\clear\clear'  # Directory with polygon annotations
output_directory = r'D:\UniDoc\y2s1\SEGP\dataset\new_yolo_dataset'  # Output directory for YOLO annotations and images
image_directory = r'D:\UniDoc\y2s1\SEGP\dataset\images\downloaded_images\clear\clear'  # Directory with original images
output_image_directory = os.path.join(output_directory, 'images')  # Output directory for copied images

# Ensure output directories exist
os.makedirs(output_directory, exist_ok=True)
os.makedirs(output_image_directory, exist_ok=True)

# Function to convert polygon points to bounding box
def convert_polygon_to_bbox(polygon_points):
    # Extract x and y coordinates
    x_coords = polygon_points[0::2]  # Even indices are x coordinates
    y_coords = polygon_points[1::2]  # Odd indices are y coordinates
    
    # Calculate bounding box
    x_min = min(x_coords)
    x_max = max(x_coords)
    y_min = min(y_coords)
    y_max = max(y_coords)
    
    # Calculate center, width, and height
    center_x = (x_min + x_max) / 2.0
    center_y = (y_min + y_max) / 2.0
    width = x_max - x_min
    height = y_max - y_min
    
    return center_x, center_y, width, height

# Function to convert polygon annotations to YOLO format and copy images
def convert_annotations_and_copy_images():
    annotation_files = [f for f in os.listdir(input_directory) if f.endswith('.txt')]
    
    # Keep track of images that have annotations
    annotated_images = set()
    
    for filename in tqdm(annotation_files, desc="Processing Annotations and Images"):
        try:
            # Convert annotation file
            input_path = os.path.join(input_directory, filename)
            output_path = os.path.join(output_directory, filename)

            with open(input_path, 'r') as file:
                lines = file.readlines()

            if not lines:
                print(f"Skipping empty file: {filename}")
                continue
            
            with open(output_path, 'w') as output_file:
                for line in lines:
                    parts = line.strip().split()
                    if len(parts) < 3:  # At least class_id and a pair of coordinates are needed
                        print(f"Skipping line in {filename} due to insufficient data: {line}")
                        continue
                    
                    class_id = parts[0]
                    try:
                        polygon_points = list(map(float, parts[1:]))
                    except ValueError:
                        print(f"Skipping line in {filename} due to parsing error: {line}")
                        continue

                    # Convert polygon points to YOLO bounding box format
                    center_x, center_y, width, height = convert_polygon_to_bbox(polygon_points)

                    # Assuming the coordinates are already normalized (0 to 1)
                    output_file.write(f"{class_id} {center_x} {center_y} {width} {height}\n")
            
            # Record the associated image as annotated
            annotated_images.add(os.path.splitext(filename)[0] + '.jpg')
        
        except Exception as e:
            print(f"Error processing file {filename}: {e}")

    # Copy all images, indicating whether they had annotations or not
    image_files = [f for f in os.listdir(image_directory) if f.endswith('.jpg')]
    for image_filename in tqdm(image_files, desc="Copying Images"):
        image_path = os.path.join(image_directory, image_filename)
        if os.path.exists(image_path):
            shutil.copy(image_path, output_image_directory)
            if image_filename in annotated_images:
                print(f"Copied annotated image: {image_filename}")
            else:
                print(f"Copied image without annotation: {image_filename}")

# Run the conversion and copying process
convert_annotations_and_copy_images()

print("Conversion completed. YOLO formatted annotations and associated images are saved in the output directory.")
