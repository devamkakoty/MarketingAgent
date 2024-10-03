
import vertexai
from vertexai.preview.vision_models import ImageGenerationModel
from io import BytesIO
from PIL import Image
from utils import GCP_PROJECT_ID

vertexai.init(project = GCP_PROJECT_ID ,location = "us-central1")

model = ImageGenerationModel.from_pretrained("imagen-3.0-fast-generate-001")

def generate_images(image_descriptions):
    image_buffers = []
    for i, desc in enumerate(image_descriptions):
        try:
            images = model.generate_images(
                prompt= desc+". Make everything look photorealistic.",
                # Optional parameters
                number_of_images=1,
                language="en",
                # You can't use a seed value and watermark at the same time.
                # add_watermark=False,
                # seed=100,
                aspect_ratio="9:16",
                safety_filter_level="block_some",
                person_generation="allow_adult",)
            
            # Convert the image to a PIL Image object
            pil_image = Image.open(BytesIO(images[0]._image_bytes))

            #images[0].save(location=f'images/output_{i}.png', include_generation_parameters=False)

            # Create a BytesIO object to hold the image data
            img_buffer = BytesIO()
            pil_image.save(img_buffer, format='PNG')
            img_buffer.seek(0)
            
            image_buffers.append(img_buffer)
            print(f"Created in-memory image buffer for image {i+1} using {len(images[0]._image_bytes)} bytes")
        except Exception as e:
            print(f"Error generating image {i+1}: {e}")
    print("Finished generating images")
    return image_buffers
