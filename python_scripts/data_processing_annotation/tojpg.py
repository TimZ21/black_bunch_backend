# Author: Zhang Shuning
# This script converts a single image file (e.g., PNG, WEBP) to JPEG format.

from PIL import Image
import os

def convert_to_jpg(input_path, output_folder):
    try:
        # Open the image file
        with Image.open(input_path) as img:
            # Convert image to RGB (if it's not already in RGB mode)
            img = img.convert("RGB")

            # Create output filename with .jpg extension
            base_name = os.path.splitext(os.path.basename(input_path))[0]
            output_path = os.path.join(output_folder, f"{base_name}.jpg")

            # Save image as JPEG
            img.save(output_path, "JPEG")
            print(f"Successfully converted: {input_path} -> {output_path}")
    except Exception as e:
        print(f"Error converting {input_path}: {e}")

if __name__ == "__main__":
    # Example usage
    input_image = r"D:\UniDoc\y2s1\DMS\coursework\CW2024\src\main\resources\com\example\demo\images\heart.webp" # Change this to your input image path
    output_dir = r"D:\UniDoc\y2s1\DMS\coursework\CW2024\src\main\resources\com\example\demo\images"    # Change this to your desired output folder

    # Ensure the output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Convert the image
    convert_to_jpg(input_image, output_dir)
