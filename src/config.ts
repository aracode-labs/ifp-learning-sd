export const APP_CONFIG = {
  name: 'IFP Learning SD',
  version: '1.0.0',
  description: 'Platform pembelajaran interaktif untuk SD Kelas 1-6 Kurikulum Merdeka',
  curriculum: 'Kurikulum Merdeka',
  grades: [1, 2, 3, 4, 5, 6],
  totalSubjects: 9,
  subjects: [
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Matematika',
    'IPA',
    'IPS',
    'Seni Budaya',
    'Pendidikan Jasmani',
    'Pendidikan Agama',
    'Pendidikan Kewarganegaraan'
  ]
};

export const CONTENT_TYPES = {
  MATERIAL: 'material',
  VIDEO: 'video',
  QUIZ: 'quiz',
  SIMULATION: 'simulation'
};

export const DIFFICULTY_LEVELS = {
  EASY: 'mudah',
  MEDIUM: 'sedang',
  HARD: 'sulit'
};
