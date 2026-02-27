import { useQuery } from '@tanstack/react-query';
import { Location } from './types';
import { wriggleClasses } from './mock-data';
import { getApiUrl } from './query-client';

async function fetchClasses(): Promise<Location[]> {
  try {
    const baseUrl = getApiUrl();
    const res = await fetch(`${baseUrl}/api/classes`);
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    return data.classes as Location[];
  } catch {
    // Server not running — fall back to mock data
    return wriggleClasses;
  }
}

export function useClasses(): { classes: Location[]; isLoading: boolean } {
  const { data, isLoading } = useQuery<Location[]>({
    queryKey: ['wriggle-classes'],
    queryFn: fetchClasses,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: false,
  });

  return {
    classes: data ?? wriggleClasses,
    isLoading,
  };
}
