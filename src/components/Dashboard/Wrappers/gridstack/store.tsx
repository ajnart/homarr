import { createWithEqualityFn } from 'zustand/traditional';
import { useConfigContext } from '~/config/provider';
import { GridstackBreakpoints } from '~/constants/gridstack-breakpoints';

export const useGridstackStore = createWithEqualityFn<GridstackStoreType>(
  (set, get) => ({
    mainAreaWidth: null,
    currentShapeSize: null,
    setMainAreaWidth: (w: number) =>
      set((v) => ({ ...v, mainAreaWidth: w, currentShapeSize: getCurrentShapeSize(w) })),
  }),
  Object.is
);

interface GridstackStoreType {
  mainAreaWidth: null | number;
  currentShapeSize: null | 'sm' | 'md' | 'lg';
  setMainAreaWidth: (width: number) => void;
}

export const useNamedWrapperColumnCount = (): 'small' | 'medium' | 'large' | null => {
  const mainAreaWidth = useGridstackStore((x) => x.mainAreaWidth);
  if (!mainAreaWidth) return null;

  if (mainAreaWidth >= 1400) return 'large';

  if (mainAreaWidth >= 800) return 'medium';

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
  return size >= GridstackBreakpoints.large
    ? 'lg'
    : size >= GridstackBreakpoints.medium
    ? 'md'
    : 'sm';
}
