import { useEffect, useState } from 'react';
import { loadData, LoadOptions } from '@/utils/dataLoader';

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
 * Hook untuk load subjects metadata
 */
export function useSubjects() {
  return useData('/subjects.json');
}

/**
 * Hook untuk load subject detail
 * @param subjectId - Subject ID
 */
export function useSubjectDetail(subjectId: string) {
  return useData(`/subjects/${subjectId}/index.json`);
}
