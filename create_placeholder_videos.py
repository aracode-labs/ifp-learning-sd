import os
import subprocess
import glob

# Create a simple placeholder video using ffmpeg
# This creates a black video with text overlay

def create_placeholder_video(output_path):
    """Create a placeholder video using ffmpeg"""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Create a simple video with text using ffmpeg
    # Duration: 5 seconds, resolution: 1920x1080, black background
    cmd = [
        'ffmpeg',
        '-f', 'lavfi',
        '-i', 'color=c=black:s=1920x1080:d=5',
        '-vf', "drawtext=text='Video Intro Topik':fontsize=80:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2",
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-y',
        output_path
    ]
    
    try:
        subprocess.run(cmd, capture_output=True, check=True)
        return True
    except Exception as e:
        print(f"Error creating video: {e}")
        return False

# Find all intro folders
intro_folders = glob.glob('public/content/kelas*-semester*/*/topik-*/intro')

print(f"Found {len(intro_folders)} intro folders")
print("Creating placeholder videos...\n")

success_count = 0
for i, folder in enumerate(sorted(intro_folders), 1):
    video_path = os.path.join(folder, 'intro-topik.mp4')
    
    if not os.path.exists(video_path):
        if create_placeholder_video(video_path):
            success_count += 1
            if i % 50 == 0:
                print(f"Progress: {i}/{len(intro_folders)} videos created")
    else:
        success_count += 1
        if i % 50 == 0:
            print(f"Progress: {i}/{len(intro_folders)} (already exist)")

print(f"\n✅ Completed! {success_count}/{len(intro_folders)} placeholder videos ready")
