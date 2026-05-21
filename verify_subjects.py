import os
import json
import glob

print("=" * 100)
print("VERIFIKASI DETAIL KELENGKAPAN PELAJARAN")
print("=" * 100)

# Get all subject JSON files
subject_files = glob.glob('public/data/kelas*/semester*/*.json')

# Track by kelas-semester-subject
incomplete = []
complete = []

for file in sorted(subject_files):
    with open(file, 'r') as f:
        data = json.load(f)
        kelas = data.get('kelas')
        semester = data.get('semester')
        subject_id = data.get('id')
        subject_name = data.get('subject')
        subject = subject_id.split('-')[0]
        
        materials = data.get('materials', [])
        
        # Check each topic
        all_exist = True
        missing_count = 0
        
        for material in materials:
            topic_id = material['id']
            topic_num = topic_id.split('-')[-1]
            
            folder_path = f"public/content/kelas{kelas}-semester{semester}/{subject}/topik-{topic_num}/intro"
            video_path = os.path.join(folder_path, 'intro-topik.mp4')
            
            if not os.path.exists(video_path):
                all_exist = False
                missing_count += 1
        
        key = f"Kelas {kelas} Semester {semester} - {subject_name} ({subject})"
        
        if all_exist and len(materials) > 0:
            complete.append(key)
        else:
            incomplete.append((key, len(materials), missing_count))

print(f"\n✅ LENGKAP ({len(complete)}):")
for item in sorted(complete):
    print(f"   {item}")

if incomplete:
    print(f"\n❌ TIDAK LENGKAP ({len(incomplete)}):")
    for item, total, missing in sorted(incomplete):
        print(f"   {item}: {missing}/{total} topik tidak ada")
else:
    print(f"\n✅ SEMUA PELAJARAN LENGKAP!")

print("\n" + "=" * 100)
