import { useQuery } from '@tanstack/react-query';

export const useGetRssFeed = () => useQuery({
  queryKey: ['rss-feed'],
  queryFn: async () => {
    const response = await fetch('/api/modules/rss');
    return response.json();
  },
});
