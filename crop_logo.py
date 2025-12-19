from PIL import Image
import numpy as np
import os

path = 'e:/MY Projects/ziko project/Front/public/images/logo.png'
try:
    img = Image.open(path)
    img = img.convert("RGBA")
    
    # Get bounding box
    datas = img.getdata()
    
    # Simple bbox find
    bbox = img.getbbox()
    if bbox:
        # Add small padding if possible
        left, upper, right, lower = bbox
        left = max(0, left - 10)
        upper = max(0, upper - 10)
        right = min(img.size[0], right + 10)
        lower = min(img.size[1], lower + 10)
        
        cropped = img.crop((left, upper, right, lower))
        cropped.save(path)
        print(f"Cropped image to {cropped.size}")
    else:
        print("No content found")

except Exception as e:
    print(e)
