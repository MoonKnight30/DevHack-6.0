import requests
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

def generate_image_with_text(input_image_url, output_image_path, headline, text):
    # Download the image from the URL
    response = requests.get(input_image_url)
    
    if response.status_code != 200:
        print("Failed to download image.")
        return
    
    # Open the image from the response content
    image = Image.open(BytesIO(response.content)).convert("RGB")
    width, height = image.size

    # Apply vignette effect to the original image only
    vignette = Image.new("L", (width, height), "black")
    for y in range(height):
        for x in range(width):
            distance_to_center = ((x - width // 2) ** 2 + (y - height // 2) ** 2) ** 0.5
            fade = max(0, 255 - int(255 * (distance_to_center / (width // 1.2))))  # Adjust intensity
            vignette.putpixel((x, y), fade)

    # Apply vignette as a mask to darken edges
    image = Image.composite(image, Image.new("RGB", (width, height), "black"), vignette)

    # Define fonts
    font_size = int(width * 0.05)  # Adjust font size dynamically
    headline_font = ImageFont.truetype("Oswald-Bold.ttf", font_size + 10)
    body_font = ImageFont.truetype("Oswald-Regular.ttf", font_size)

    draw = ImageDraw.Draw(image)

    # Determine max text width (80% of image width)
    max_text_width = int(width * 0.8)

    # Function to wrap text within max width
    def wrap_text(text, font, max_width):
        words = text.split()
        lines = []
        while words:
            line = ""
            while words and draw.textbbox((0, 0), line + words[0], font=font)[2] < max_width:
                line += (words.pop(0) + " ")
            lines.append(line.strip())
        return lines

    # Wrap headline and body text
    wrapped_headline = wrap_text(headline, headline_font, max_text_width)
    wrapped_body = wrap_text(text, body_font, max_text_width)

    # Calculate total text height
    padding = 10
    headline_height = sum(draw.textbbox((0, 0), line, font=headline_font)[3] for line in wrapped_headline) + padding
    body_text_height = sum(draw.textbbox((0, 0), line, font=body_font)[3] for line in wrapped_body) + padding
    total_text_height = headline_height + body_text_height + (len(wrapped_headline) + len(wrapped_body)) * padding

    # Create a new image with black padding
    new_image = Image.new("RGB", (width, height + total_text_height), "black")
    new_image.paste(image, (0, 0))

    # Create a soft gradient effect for the black padding
    gradient = Image.new("L", (width, total_text_height))
    for y in range(total_text_height):
        fade = int(255 * (1 - (y / total_text_height)))  # Fade from black (255) to transparent (0)
        ImageDraw.Draw(gradient).line([(0, y), (width, y)], fill=fade)

    # Apply the gradient to the black padding **before adding text**
    black_overlay = Image.new("RGB", (width, total_text_height), "black")
    black_overlay.putalpha(gradient)  # Make it semi-transparent
    new_image.paste(black_overlay, (0, height), black_overlay)

    # Draw text in the black padded area **on top of the gradient**
    draw = ImageDraw.Draw(new_image)
    text_y = height + padding

    # Draw headline
    for line in wrapped_headline:
        text_width = draw.textbbox((0, 0), line, font=headline_font)[2]
        text_x = (width - text_width) // 2  # Center align
        draw.text((text_x, text_y), line, font=headline_font, fill="white")
        text_y += draw.textbbox((0, 0), line, font=headline_font)[3] + padding

    # Draw body text
    for line in wrapped_body:
        text_width = draw.textbbox((0, 0), line, font=body_font)[2]
        text_x = (width - text_width) // 2  # Center align
        draw.text((text_x, text_y), line, font=body_font, fill="white")
        text_y += draw.textbbox((0, 0), line, font=body_font)[3] + padding

    # Save the output image
    new_image.save(output_image_path)
    print(f"Image saved as {output_image_path}")

# Example usage
generate_image_with_text("https://example.com/image.png", "output.png", "Breaking News", "This is a long sample text that should wrap properly within the image width. A gradient and vignette effect are applied.")
