import { useMantineTheme } from '@mantine/core';
import create from 'zustand';
import { GridstackBreakpoints } from '../../../../constants/gridstack-breakpoints';

export const useGridstackStore = create<GridstackStoreType>((set, get) => ({
  mainAreaWidth: null,
  currentShapeSize: null,
  setMainAreaWidth: (w: number) =>
    set((v) => ({ ...v, mainAreaWidth: w, currentShapeSize: getCurrentShapeSize(w) })),
}));

interface GridstackStoreType {
  mainAreaWidth: null | number;
  currentShapeSize: null | 'sm' | 'md' | 'lg';
  setMainAreaWidth: (width: number) => void;
}

export const useNamedWrapperColumnCount = (): 'small' | 'medium' | 'large' | null => {
  const mainAreaWidth = useGridstackStore((x) => x.mainAreaWidth);
  const { sm, xl } = useMantineTheme().breakpoints;
  if (!mainAreaWidth) return null;

  if (mainAreaWidth >= xl) return 'large';

  if (mainAreaWidth >= sm) return 'medium';

  return 'small';
};

export const useWrapperColumnCount = () => {
  // TODO: Implement the config hook and read out the column count out of the settings.
  // Use default fallbacks and check for values out of range, to ensure that this never fails!
  switch (useNamedWrapperColumnCount()) {
    case 'large':
      return 12;
    case 'medium':
      return 6;
    case 'small':
      return 3;
    default:
      return null;
  }
};

function getCurrentShapeSize(size: number) {
  return size >= GridstackBreakpoints.Large
    ? 'lg'
    : size >= GridstackBreakpoints.Medium
    ? 'md'
    : 'sm';
}
