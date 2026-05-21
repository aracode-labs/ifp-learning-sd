/**
 * Data Loader Utility
 * Fetch JSON data dari public/data folder secara dinamis
 * Structure: /data/kelas{1-6}/semester{1-2}/{subject}.json
 */

const DATA_BASE_PATH = '/data';

export interface LoadOptions {
  cache?: boolean;
}

// Simple cache untuk avoid multiple requests
const dataCache = new Map<string, any>();

/**
 * Fetch JSON data dari public/data folder
 * @param path - Path relative ke public/data (contoh: 'subjects-by-class.json' atau 'kelas1/semester1/ipa.json')
 * @param options - Loading options (cache, etc) * @returns Parsed JSON data
 */
export async function loadData<T = any>(
  path: string,
  options: LoadOptions = { cache: true }
): Promise<T> {
  const fullPath = `${DATA_BASE_PATH}/${path}`;

  // Check cache
  if (options.cache && dataCache.has(fullPath)) {
    return dataCache.get(fullPath);
  }

  try {
    const response = await fetch(fullPath);
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as T;

    // Store in cache
    if (options.cache) {
      dataCache.set(fullPath, data);
    }

    return data;
  } catch (error) {
    console.error(`Error loading data from ${fullPath}:`, error);
    throw error;
  }
}

/**
 * Load subjects by class (untuk SubjectMenu)
 */
export async function loadSubjectsByClass() {
  return loadData('/subjects-by-class.json');
}

/**
 * Load subject content untuk kelas dan semester tertentu
 * @param kelas - Kelas (1-6)
 * @param semester - Semester (1-2)
 * @param subjectCode - Subject code (ipa, matematika, dll)
 */
export async function loadSubjectContent(kelas: number, semester: number, subjectCode: string) {
  const path = `kelas${kelas}/semester${semester}/${subjectCode}.json`;
  return loadData(path);
}

/**
 * Clear data cache
 */
export function clearDataCache() {
  dataCache.clear();
}

/**
 * Get cache info (debugging)
 */
export function getCacheInfo() {
  return {
    size: dataCache.size,
    keys: Array.from(dataCache.keys()),
  };
}
