# This script updates YOLO-format annotation files by changing all occurrences of class ID '1' to '0' to remove the default label and make balack bunch the only label
# It reads all .txt annotation files from the specified directory, modifies the class labels, and saves the updated files to a new directory.
import os
import glob

# Path to YOLO annotation files
annotation_path = r"D:\UniDoc\y2s1\SEGP\dataset\script_testing\yolo_dataset_splited\labels\val"  # Change this to your dataset labels directory
output_path = r"D:\UniDoc\y2s1\SEGP\dataset\script_testing\yolo_dataset_splited\new_labels\val"  # Optional: Use if you want to save modified files separately

# Create output directory if it doesn't exist
os.makedirs(output_path, exist_ok=True)

# Get all annotation files (.txt)
annotation_files = glob.glob(os.path.join(annotation_path, "*.txt"))

for file_path in annotation_files:
    with open(file_path, "r") as file:
        lines = file.readlines()

    modified_lines = []
    
    for line in lines:
        parts = line.strip().split()
        if len(parts) == 5:
            class_id = int(parts[0])
            
            # If class_id is 1, change it to 0
            if class_id == 1:
                parts[0] = "0"

            modified_lines.append(" ".join(parts))

    # Save the modified annotations
    output_file_path = os.path.join(output_path, os.path.basename(file_path))
    with open(output_file_path, "w") as file:
        file.write("\n".join(modified_lines) + "\n")

print("YOLO annotations updated successfully!")
