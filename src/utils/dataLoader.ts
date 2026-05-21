/**
 * Data Loader Utility
 * Fetch JSON data dari public/data folder secara dinamis
 */

const DATA_BASE_PATH = '/data';

export interface LoadOptions {
  cache?: boolean;
}

// Simple cache untuk avoid multiple requests
const dataCache = new Map<string, any>();

/**
 * Fetch JSON data dari public/data folder
 * @param path - Path relative ke public/data (contoh: 'subjects.json' atau 'subjects/ipa/index.json')
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
 * Load subjects metadata
 */
export async function loadSubjects() {
  return loadData('/subjects.json');
}

/**
 * Load subject detail (materials, videos, quizzes)
 * @param subjectId - Subject ID (contoh: 'ipa', 'matematika')
 */
export async function loadSubjectDetail(subjectId: string) {
  return loadData(`/subjects/${subjectId}/index.json`);
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
