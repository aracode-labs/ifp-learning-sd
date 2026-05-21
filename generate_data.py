#!/usr/bin/env python3
"""
Generate JSON data files untuk semua subject, kelas, dan semester
"""

import json
import os
from pathlib import Path

# Subject definitions dengan materi default
SUBJECTS = {
    'bahasa-indonesia': {
        'name': 'Bahasa Indonesia',
        'icon': '📖',
        'color': '#FFE66D',
    },
    'bahasa-inggris': {
        'name': 'Bahasa Inggris',
        'icon': '🌐',
        'color': '#95E1D3',
    },
    'matematika': {
        'name': 'Matematika',
        'icon': '🔢',
        'color': '#4ECDC4',
    },
    'ipa': {
        'name': 'IPA',
        'icon': '🔬',
        'color': '#FF6B6B',
    },
    'ips': {
        'name': 'IPS',
        'icon': '🌍',
        'color': '#A8D8EA',
    },
    'pkn': {
        'name': 'PKN',
        'icon': '🇮🇩',
        'color': '#F5B041',
    },
    'penjas': {
        'name': 'Penjas',
        'icon': '⚽',
        'color': '#85C1E9',
    },
    'seni': {
        'name': 'Seni',
        'icon': '🎨',
        'color': '#F7DC6F',
    },
    'agama': {
        'name': 'Agama',
        'icon': '🙏',
        'color': '#BB8FCE',
    },
}

# Template materi berdasarkan subject
MATERIAL_TEMPLATES = {
    'bahasa-indonesia': [
        {'title': 'Belajar Membaca Huruf', 'description': 'Pengenalan huruf A-Z', 'chapter': 1, 'duration': 15},
        {'title': 'Membaca Kata Sederhana', 'description': 'Membaca kata-kata pendek', 'chapter': 2, 'duration': 20},
        {'title': 'Menulis Huruf Kapital', 'description': 'Belajar menulis huruf A-Z', 'chapter': 3, 'duration': 25},
        {'title': 'Pengucapan Kata Dasar', 'description': 'Melatih pengucapan', 'chapter': 4, 'duration': 15},
        {'title': 'Mendengarkan dan Memahami', 'description': 'Melatih kemampuan menyimak', 'chapter': 5, 'duration': 20},
    ],
    'matematika': [
        {'title': 'Mengenal Bilangan 1-10', 'description': 'Pengenalan bilangan dasar', 'chapter': 1, 'duration': 20},
        {'title': 'Penjumlahan Dasar', 'description': 'Belajar menjumlah hingga 10', 'chapter': 2, 'duration': 25},
        {'title': 'Pengurangan Dasar', 'description': 'Belajar mengurangi hingga 10', 'chapter': 3, 'duration': 25},
        {'title': 'Bentuk Geometri', 'description': 'Mengenal segitiga, persegi, lingkaran', 'chapter': 4, 'duration': 20},
        {'title': 'Pengukuran Panjang', 'description': 'Belajar mengukur panjang benda', 'chapter': 5, 'duration': 15},
    ],
    'ipa': [
        {'title': 'Bagian Tubuh Manusia', 'description': 'Mengenal bagian tubuh dan fungsinya', 'chapter': 1, 'duration': 20},
        {'title': 'Panca Indra', 'description': 'Belajar tentang panca indra', 'chapter': 2, 'duration': 20},
        {'title': 'Lingkungan Sekitar', 'description': 'Mengenal lingkungan alam dan buatan', 'chapter': 3, 'duration': 25},
        {'title': 'Hewan dan Tumbuhan', 'description': 'Klasifikasi hewan dan tumbuhan', 'chapter': 4, 'duration': 20},
        {'title': 'Musim dan Cuaca', 'description': 'Mengenal musim dan perubahan cuaca', 'chapter': 5, 'duration': 15},
    ],
    'ips': [
        {'title': 'Keluargaku', 'description': 'Mengenal anggota keluarga', 'chapter': 1, 'duration': 15},
        {'title': 'Rumahku dan Lingkungannya', 'description': 'Mengenal rumah dan lingkungan', 'chapter': 2, 'duration': 20},
        {'title': 'Budaya Daerahku', 'description': 'Mengenal budaya lokal', 'chapter': 3, 'duration': 25},
        {'title': 'Pekerjaan Orang Tua', 'description': 'Mengenal berbagai jenis pekerjaan', 'chapter': 4, 'duration': 20},
        {'title': 'Transportasi', 'description': 'Belajar tentang alat transportasi', 'chapter': 5, 'duration': 15},
    ],
    'bahasa-inggris': [
        {'title': 'Greeting and Introduction', 'description': 'Belajar sapa dan perkenalan', 'chapter': 1, 'duration': 15},
        {'title': 'Nama-nama Benda', 'description': 'Belajar nama-nama benda dalam bahasa Inggris', 'chapter': 2, 'duration': 20},
        {'title': 'Warna dan Angka', 'description': 'Mengenal warna dan angka', 'chapter': 3, 'duration': 20},
        {'title': 'Keluarga', 'description': 'Belajar nama-nama anggota keluarga', 'chapter': 4, 'duration': 15},
        {'title': 'Hewan Peliharaan', 'description': 'Belajar nama-nama hewan', 'chapter': 5, 'duration': 15},
    ],
    'pkn': [
        {'title': 'Identitas Nasional', 'description': 'Mengenal lambang negara Indonesia', 'chapter': 1, 'duration': 20},
        {'title': 'Aturan dan Norma', 'description': 'Memahami aturan di sekolah dan rumah', 'chapter': 2, 'duration': 20},
        {'title': 'Hak dan Kewajiban', 'description': 'Belajar tentang hak dan kewajiban', 'chapter': 3, 'duration': 25},
        {'title': 'Keragaman Indonesia', 'description': 'Mengenal keragaman budaya Indonesia', 'chapter': 4, 'duration': 20},
        {'title': 'Pancasila', 'description': 'Belajar tentang nilai-nilai Pancasila', 'chapter': 5, 'duration': 20},
    ],
    'penjas': [
        {'title': 'Gerakan Dasar Tubuh', 'description': 'Belajar gerakan dasar berjalan, berlari', 'chapter': 1, 'duration': 20},
        {'title': 'Keseimbangan', 'description': 'Melatih keseimbangan tubuh', 'chapter': 2, 'duration': 20},
        {'title': 'Permainan Bola Besar', 'description': 'Belajar bermain bola', 'chapter': 3, 'duration': 30},
        {'title': 'Senam Ringan', 'description': 'Latihan senam sederhana', 'chapter': 4, 'duration': 25},
        {'title': 'Kebugaran Jasmani', 'description': 'Belajar tentang kebugaran tubuh', 'chapter': 5, 'duration': 20},
    ],
    'seni': [
        {'title': 'Menggambar Bentuk', 'description': 'Belajar menggambar bentuk dasar', 'chapter': 1, 'duration': 25},
        {'title': 'Pewarnaan', 'description': 'Belajar teknik pewarnaan', 'chapter': 2, 'duration': 25},
        {'title': 'Kolase', 'description': 'Membuat karya seni dari berbagai bahan', 'chapter': 3, 'duration': 30},
        {'title': 'Musik Tradisional', 'description': 'Mengenal musik dan alat musik tradisional', 'chapter': 4, 'duration': 20},
        {'title': 'Tari Tradisional', 'description': 'Mempelajari tari-tari tradisional', 'chapter': 5, 'duration': 25},
    ],
    'agama': [
        {'title': 'Aku Cinta Tuhan', 'description': 'Belajar tentang rasa syukur kepada Tuhan', 'chapter': 1, 'duration': 15},
        {'title': 'Doa-doa Sederhana', 'description': 'Belajar doa-doa dasar sehari-hari', 'chapter': 2, 'duration': 20},
        {'title': 'Akhlak Mulia', 'description': 'Belajar tentang akhlak baik', 'chapter': 3, 'duration': 25},
        {'title': 'Perilaku Terpuji', 'description': 'Mengenal perilaku yang baik', 'chapter': 4, 'duration': 20},
        {'title': 'Ibadah Dasar', 'description': 'Belajar tentang ibadah dalam kehidupan sehari-hari', 'chapter': 5, 'duration': 20},
    ],
}

def generate_material(subject_id, material_template, chapter_offset=0):
    """Generate material dengan ID unik"""
    materials = []
    content_types_map = {
        'membaca': ['membaca', 'interaktif'],
        'matematika': ['interaktif', 'quiz', 'video'],
        'ipa': ['membaca', 'video', '3d'],
        'ips': ['membaca', 'video', 'interaktif'],
        'bahasa-inggris': ['video', 'interaktif', 'quiz'],
        'pkn': ['membaca', 'video', 'interaktif'],
        'penjas': ['video', 'interaktif'],
        'seni': ['interaktif', 'video', '3d'],
        'agama': ['membaca', 'video', 'interaktif'],
    }
    
    content_types = content_types_map.get(subject_id, ['membaca', 'interaktif', 'video'])
    
    for idx, material in enumerate(material_template):
        materials.append({
            'id': f"{subject_id}-{idx + chapter_offset + 1}",
            'title': material['title'],
            'description': material['description'],
            'chapter': material['chapter'] + chapter_offset,
            'duration_minutes': material['duration'],
            'content_types': content_types
        })
    
    return materials

def create_subject_file(kelas, semester, subject_id, subject_info):
    """Create JSON file untuk satu subject"""
    base_dir = f'public/data/kelas{kelas}/semester{semester}'
    os.makedirs(base_dir, exist_ok=True)
    
    file_path = os.path.join(base_dir, f'{subject_id}.json')
    
    template = MATERIAL_TEMPLATES.get(subject_id, MATERIAL_TEMPLATES['bahasa-indonesia'])
    materials = generate_material(subject_id, template)
    
    data = {
        'id': f"{subject_id}-{kelas}-{semester}",
        'subject': subject_info['name'],
        'kelas': kelas,
        'semester': semester,
        'icon': subject_info['icon'],
        'color': subject_info['color'],
        'materials': materials
    }
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Created: {file_path}")

def main():
    """Generate semua file JSON"""
    print("Generating subject data files...")
    
    for kelas in range(1, 7):  # Kelas 1-6
        for semester in range(1, 3):  # Semester 1-2
            for subject_id, subject_info in SUBJECTS.items():
                create_subject_file(kelas, semester, subject_id, subject_info)
    
    print("\n✓ All data files generated successfully!")

if __name__ == '__main__':
    main()
