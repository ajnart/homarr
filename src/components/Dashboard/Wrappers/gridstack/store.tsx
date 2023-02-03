import { useMantineTheme } from '@mantine/core';
import create from 'zustand';
import { useConfigContext } from '../../../../config/provider';
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
  const { config } = useConfigContext();

  if (!config) {
    return null;
  }

  switch (useNamedWrapperColumnCount()) {
    case 'large':
      return config.settings.customization.gridstack?.columnCountLarge ?? 12;
    case 'medium':
      return config.settings.customization.gridstack?.columnCountMedium ?? 6;
    case 'small':
      return config.settings.customization.gridstack?.columnCountSmall ?? 3;
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
