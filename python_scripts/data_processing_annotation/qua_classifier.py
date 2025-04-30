# Author: Zhang Shuning
# Filter blur images
# This script classifies images into 'clear' and 'blurred' categories based on blurriness detection using OpenCV.
# It then trains a Convolutional Neural Network (CNN) model to learn and classify the images automatically.

import os
import shutil
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from tensorflow.keras.callbacks import ModelCheckpoint

# Set GPU configuration
physical_devices = tf.config.list_physical_devices('GPU')
if len(physical_devices) > 0:
    tf.config.experimental.set_memory_growth(physical_devices[0], True)

# Define the path to your folder containing images
data_dir = r'D:\UniDoc\y2s1\SEGP\dataset\images\downloaded_images\clear'
blurred_dir = os.path.join(data_dir, 'blurred')
clear_dir = os.path.join(data_dir, 'clear')

# Create directories to store classified images
os.makedirs(blurred_dir, exist_ok=True)
os.makedirs(clear_dir, exist_ok=True)

# Counters for tracking classification
blurred_count = 0
clear_count = 0

# Function to determine if an image is blurry
def is_blurry(image_path, threshold=100.0):
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if image is None:
        return False
    variance = cv2.Laplacian(image, cv2.CV_64F).var()
    return variance < threshold

# Classify images into 'blurred' and 'clear' folders
for image_name in os.listdir(data_dir):
    image_path = os.path.join(data_dir, image_name)
    if os.path.isfile(image_path):
        if is_blurry(image_path):
            shutil.move(image_path, os.path.join(blurred_dir, image_name))
            blurred_count += 1
        else:
            shutil.move(image_path, os.path.join(clear_dir, image_name))
            clear_count += 1

# Display classification results
print(f"Total blurred images classified: {blurred_count}")
print(f"Total clear images classified: {clear_count}")

# Initialize ImageDataGenerators for training and validation
train_datagen = ImageDataGenerator(rescale=1.0/255, validation_split=0.2)

train_generator = train_datagen.flow_from_directory(
    data_dir,
    target_size=(150, 150),
    batch_size=32,
    class_mode='binary',
    subset='training'
)

validation_generator = train_datagen.flow_from_directory(
    data_dir,
    target_size=(150, 150),
    batch_size=32,
    class_mode='binary',
    subset='validation'
)

# Create a simple CNN model
model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(150, 150, 3)),
    MaxPooling2D((2, 2)),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Flatten(),
    Dense(128, activation='relu'),
    Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Add a model checkpoint callback to save the best model during training
checkpoint = ModelCheckpoint('best_model.h5', monitor='val_accuracy', save_best_only=True, verbose=1)

# Train the model
model.fit(train_generator, validation_data=validation_generator, epochs=10, callbacks=[checkpoint])

# Display final training summary
print("Training complete. Best model saved as 'best_model.h5'")
