import os
import json
import glob

print("=" * 80)
print("VERIFIKASI STRUKTUR TOPIK")
print("=" * 80)

# Get all subject JSON files
subject_files = glob.glob('public/data/kelas*/semester*/*.json')

# Track statistics
stats = {
    'total_topics_expected': 0,
    'total_topics_folders': 0,
    'total_videos': 0,
    'missing_videos': [],
    'by_kelas': {}
}

# Parse all topics from JSON
for file in sorted(subject_files):
    with open(file, 'r') as f:
        data = json.load(f)
        kelas = data.get('kelas')
        semester = data.get('semester')
        subject_id = data.get('id')
        subject = subject_id.split('-')[0]
        
        materials = data.get('materials', [])
        key = f"kelas{kelas}-semester{semester}"
        
        if key not in stats['by_kelas']:
            stats['by_kelas'][key] = {'expected': 0, 'found': 0}
        
        for material in materials:
            stats['total_topics_expected'] += 1
            stats['by_kelas'][key]['expected'] += 1
            
            topic_id = material['id']
            topic_num = topic_id.split('-')[-1]
            
            folder_path = f"public/content/kelas{kelas}-semester{semester}/{subject}/topik-{topic_num}/intro"
            video_path = os.path.join(folder_path, 'intro-topik.mp4')
            
            if os.path.exists(folder_path):
                stats['total_topics_folders'] += 1
                stats['by_kelas'][key]['found'] += 1
            
            if os.path.exists(video_path):
                stats['total_videos'] += 1
            else:
                stats['missing_videos'].append(f"{kelas}-{semester}: {subject}/topik-{topic_num}")

print(f"\n📊 STATISTIK UMUM:")
print(f"   Total topik yang diharapkan: {stats['total_topics_expected']}")
print(f"   Total folder topik dibuat: {stats['total_topics_folders']}")
print(f"   Total video placeholder: {stats['total_videos']}")

print(f"\n📂 DETAIL PER KELAS-SEMESTER:")
for key in sorted(stats['by_kelas'].keys()):
    expected = stats['by_kelas'][key]['expected']
    found = stats['by_kelas'][key]['found']
    status = "✅" if expected == found else "❌"
    print(f"   {status} {key}: {found}/{expected} folder topik")

if stats['missing_videos']:
    print(f"\n⚠️  MISSING VIDEOS ({len(stats['missing_videos'])}):")
    for missing in stats['missing_videos'][:10]:
        print(f"   - {missing}")
    if len(stats['missing_videos']) > 10:
        print(f"   ... dan {len(stats['missing_videos']) - 10} lainnya")
else:
    print(f"\n✅ SEMUA VIDEO LENGKAP!")

print("\n" + "=" * 80)
if stats['total_topics_expected'] == stats['total_topics_folders'] == stats['total_videos']:
    print("✅ STRUKTUR TOPIK LENGKAP DAN KONSISTEN")
else:
    print("❌ ADA YANG TIDAK LENGKAP")
print("=" * 80)
