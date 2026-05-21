import { useEffect, useState } from 'react';
import { loadData, loadSubjectContent, LoadOptions } from '@/utils/dataLoader';

interface UseDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook untuk load data dari public/data folder
 * @param path - Path relative ke public/data
 * @param options - Loading options
 * @returns {data, loading, error}
 */
export function useData<T = any>(
  path: string,
  options?: LoadOptions
): UseDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await loadData<T>(path, options);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [path, options]);

  return { data, loading, error };
}

/**
 * Hook untuk load subjects by class
 */
export function useSubjectsByClass() {
  return useData('/subjects-by-class.json');
}

/**
 * Hook untuk load subject content untuk kelas dan semester tertentu
 * @param kelas - Kelas (1-6)
 * @param semester - Semester (1-2)
 * @param subjectCode - Subject code
 */
export function useSubjectContent(kelas: number | null, semester: number | null, subjectCode: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!kelas || !semester || !subjectCode) {
      setData(null);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await loadSubjectContent(kelas, semester, subjectCode);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [kelas, semester, subjectCode]);

  return { data, loading, error };
}
