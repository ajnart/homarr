import { useQuery } from '@tanstack/react-query';
import { IconSelectorItem } from '../../types/iconSelector/iconSelectorItem';

export const useRepositoryIconsQuery = <TRepositoryIcon extends object>({
  url,
  converter,
}: {
  url: string;
  converter: (value: TRepositoryIcon) => IconSelectorItem;
}) =>
  useQuery({
    queryKey: ['repository-icons', { url }],
    queryFn: async () => fetchRepositoryIcons<TRepositoryIcon>(url),
    select(data) {
      return data.map((x) => converter(x));
    },
    refetchOnWindowFocus: false,
  });

const fetchRepositoryIcons = async <TRepositoryIcon extends object>(
  url: string
): Promise<TRepositoryIcon[]> => {
  const response = await fetch(
    'https://api.github.com/repos/walkxcode/Dashboard-Icons/contents/png'
  );
  return response.json();
};
