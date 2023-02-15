import { useQuery } from '@tanstack/react-query';

export const useGetRssFeed = (feedUrl: string) =>
  useQuery({
    queryKey: ['rss-feed', feedUrl],
    queryFn: async () => {
      const response = await fetch('/api/modules/rss');
      return response.json();
    },
  });
