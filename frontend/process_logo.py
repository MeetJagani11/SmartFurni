from rembg import remove
from PIL import Image
import io

input_path = "C:/Users/LENOVO/.gemini/antigravity/brain/d082593a-bbbf-4d4a-b247-b436812a80b9/media__1772353768361.png"
output_path = "e:/Meet/Project/Project/SmartFurni/frontend/public/logo.png"

try:
    with open(input_path, 'rb') as i:
        input_data = i.read()

    output_data = remove(input_data)
    img = Image.open(io.BytesIO(output_data))
    
    # create white background
    background = Image.new('RGB', img.size, (255, 255, 255))
    background.paste(img, mask=img.split()[3]) # 3 is the alpha channel
    background.save(output_path)
    print("Success")
except Exception as e:
    print(f"Error: {e}")
