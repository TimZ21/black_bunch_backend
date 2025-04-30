# Author: Zhang Shuning
# This script splits a YOLO-formatted dataset into training and validation sets.
# It organizes images and their corresponding label files into 'train' and 'val' directories under 'images' and 'labels' folders.
# The split is performed based on a specified ratio (default is 80% train, 20% validation).

import os
import shutil
import random

def split_dataset(images_path, labels_path, output_path, train_ratio=0.8):
    # Create output directories
    train_images_path = os.path.join(output_path, 'images/train')
    val_images_path = os.path.join(output_path, 'images/val')
    train_labels_path = os.path.join(output_path, 'labels/train')
    val_labels_path = os.path.join(output_path, 'labels/val')

    os.makedirs(train_images_path, exist_ok=True)
    os.makedirs(val_images_path, exist_ok=True)
    os.makedirs(train_labels_path, exist_ok=True)
    os.makedirs(val_labels_path, exist_ok=True)

    # Get all image files
    image_files = [f for f in os.listdir(images_path) if f.endswith('.jpg')]
    random.shuffle(image_files)

    # Split dataset
    split_index = int(len(image_files) * train_ratio)
    train_files = image_files[:split_index]
    val_files = image_files[split_index:]

    # Copy files to train and val folders
    for file in train_files:
        shutil.copy(os.path.join(images_path, file), train_images_path)
        label_file = os.path.splitext(file)[0] + '.txt'
        if os.path.exists(os.path.join(labels_path, label_file)):
            shutil.copy(os.path.join(labels_path, label_file), train_labels_path)

    for file in val_files:
        shutil.copy(os.path.join(images_path, file), val_images_path)
        label_file = os.path.splitext(file)[0] + '.txt'
        if os.path.exists(os.path.join(labels_path, label_file)):
            shutil.copy(os.path.join(labels_path, label_file), val_labels_path)

if __name__ == '__main__':
    # Define paths
    images_path = 'D:\\UniDoc\\y2s1\\SEGP\\dataset\\new_yolo_dataset\\images'  # Path to images
    labels_path = 'D:\\UniDoc\\y2s1\\SEGP\\dataset\\new_yolo_dataset'  # Path to labels
    output_path = 'D:\\UniDoc\\y2s1\\SEGP\\dataset\\new_yolo_dataset\\yolo_dataset_splited'  # Path to save split dataset

    # Split dataset
    split_dataset(images_path, labels_path, output_path)
    print("Dataset split completed!")
