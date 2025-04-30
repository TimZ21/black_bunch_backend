# Convert Json file to txt file

import json

def convert_json_to_txt(json_path, txt_path):
    with open(json_path, "r") as f:
        data = json.load(f)

    img_width = data["info"]["width"]
    img_height = data["info"]["height"]

    with open(txt_path, "w") as f:
        for obj in data["objects"]:
            category = 1  # Assuming "Black Bunch" is labeled as '1'
            normalized_coords = []

            for x, y in obj["segmentation"]:
                norm_x = x / img_width
                norm_y = y / img_height
                normalized_coords.append(f"{norm_x} {norm_y}")

            line = f"{category} " + " ".join(normalized_coords) + "\n"
            f.write(line)

# Example usage
convert_json_to_txt(r"D:\UniDoc\y2s1\SEGP\dataset\images\downloaded_images\clear\clear/net1.json", 
                    r"D:\UniDoc\y2s1\SEGP\dataset\images\downloaded_images\clear\net1.txt")

print("Conversion complete. Output saved to 0008eba8a0_001_converted.txt")
