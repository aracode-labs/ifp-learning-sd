import os
import json
import glob

# Get all subject JSON files
subject_files = glob.glob('public/data/kelas*/semester*/*.json')

# Create folder structure: kelas{n}-semester{n}/{subject}/topik-{topicNum}/intro
for file in sorted(subject_files):
    with open(file, 'r') as f:
        data = json.load(f)
        kelas = data.get('kelas')
        semester = data.get('semester')
        subject = data.get('id').split('-')[0]  # e.g., 'matematika' from 'matematika-1-1'
        
        materials = data.get('materials', [])
        for material in materials:
            topic_id = material['id']
            # Extract topic number (e.g., '1' from 'matematika-1')
            topic_num = topic_id.split('-')[-1]
            
            folder_path = f"public/content/kelas{kelas}-semester{semester}/{subject}/topik-{topic_num}/intro"
            os.makedirs(folder_path, exist_ok=True)
            print(f"Created: {folder_path}")

print("\nFolder structure created successfully!")
