import { useQuery } from '@tanstack/react-query';

export const useGetRssFeed = (feedUrl: string, widgetId: string) =>
  useQuery({
    queryKey: ['rss-feed', feedUrl],
    queryFn: async () => {
      const response = await fetch(`/api/modules/rss?widgetId=${widgetId}`);
      return response.json();
    },
  });
