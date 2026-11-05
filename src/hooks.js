import { useQuery } from '@tanstack/react-query';
import { api } from './api.js';
export const useLookups = () =>
  useQuery({
    queryKey: ['lookups'],
    queryFn: () => api('/lookups'),
    staleTime: 5 * 60 * 1000,
  });
