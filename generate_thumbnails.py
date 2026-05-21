#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw, ImageFont
import random

# Pelajaran dengan warna dan emoji
subjects = [
    {'id': 'ipa', 'name': 'IPA', 'emoji': '🔬', 'color': '#FF6B6B'},
    {'id': 'matematika', 'name': 'Matematika', 'emoji': '🔢', 'color': '#4ECDC4'},
    {'id': 'bahasa-indonesia', 'name': 'Bahasa Indonesia', 'emoji': '📖', 'color': '#FFE66D'},
    {'id': 'bahasa-inggris', 'name': 'Bahasa Inggris', 'emoji': '🌐', 'color': '#95E1D3'},
    {'id': 'ips', 'name': 'IPS', 'emoji': '🌍', 'color': '#A8D8EA'},
    {'id': 'seni', 'name': 'Seni', 'emoji': '🎨', 'color': '#F7DC6F'},
    {'id': 'penjas', 'name': 'Penjas', 'emoji': '⚽', 'color': '#85C1E9'},
    {'id': 'pkn', 'name': 'PKN', 'emoji': '🇮🇩', 'color': '#F5B041'},
    {'id': 'agama', 'name': 'Agama', 'emoji': '🙏', 'color': '#BB8FCE'},
]

# Konversi hex ke RGB
def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

# Generate gradient color
def get_gradient_colors(base_color):
    rgb = hex_to_rgb(base_color)
    # Gradient dari base color ke shade lebih gelap
    darker = tuple(int(c * 0.7) for c in rgb)
    return rgb, darker

# Create placeholder image
def create_placeholder(subject_name, kelas, semester, color):
    width, height = 1200, 800
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)
    
    # Background dengan gradient (simulasi dengan rectangle bertingkat)
    rgb, darker_rgb = get_gradient_colors(color)
    
    # Draw gradient background (simple version)
    for y in range(height):
        r = int(rgb[0] + (darker_rgb[0] - rgb[0]) * y / height)
        g = int(rgb[1] + (darker_rgb[1] - rgb[1]) * y / height)
        b = int(rgb[2] + (darker_rgb[2] - rgb[2]) * y / height)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    # Draw semi-transparent white rectangle at bottom for text
    overlay = Image.new('RGBA', (width, height), (255, 255, 255, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.rectangle([0, height//2, width, height], fill=(255, 255, 255, 100))
    img.paste(Image.alpha_composite(img.convert('RGBA'), overlay), (0, 0))
    img = img.convert('RGB')
    draw = ImageDraw.Draw(img)
    
    # Gunakan font default karena font custom mungkin tidak tersedia
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 60)
        subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
        text_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
    
    # Draw text
    title = f"{subject_name}"
    subtitle = f"Kelas {kelas} - Semester {semester}"
    
    # Center text
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (width - subtitle_width) // 2
    
    # Draw shadow effect
    draw.text((title_x + 2, height//2 + 100), title, font=title_font, fill=(0, 0, 0, 128))
    draw.text((title_x, height//2 + 100), title, font=title_font, fill=(255, 255, 255))
    
    draw.text((subtitle_x + 2, height//2 + 180), subtitle, font=subtitle_font, fill=(0, 0, 0, 128))
    draw.text((subtitle_x, height//2 + 180), subtitle, font=subtitle_font, fill=(51, 51, 51))
    
    return img

# Create directories dan generate images
base_path = '/Users/sugenghariadi/ifp-learning-sd/public/content'
count = 0

for kelas in range(1, 7):
    for semester in range(1, 3):
        kelas_folder = f'{base_path}/kelas{kelas}-semester{semester}'
        
        for subject in subjects:
            subject_path = f'{kelas_folder}/{subject["id"]}'
            thumbnail_path = f'{subject_path}/thumbnail'
            
            # Create thumbnail directory if not exists
            os.makedirs(thumbnail_path, exist_ok=True)
            
            # Create placeholder image
            img = create_placeholder(
                subject['name'], 
                kelas, 
                semester, 
                subject['color']
            )
            
            # Save image
            image_file = f'{thumbnail_path}/thumbnail.jpg'
            img.save(image_file, 'JPEG', quality=90)
            count += 1
            print(f'✅ Created: {subject["name"]} - Kelas {kelas} Semester {semester}')

print(f'\n🎉 Total images created: {count}')
