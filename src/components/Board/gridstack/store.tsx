// TODO: This file can be deleted once the new gridstack is fully implemented
import { createWithEqualityFn } from 'zustand/traditional';
import { GridstackBreakpoints } from '~/constants/gridstack-breakpoints';

import { useRequiredBoard } from '../context';

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
  const board = useRequiredBoard();

  return board.layout.columnCount;
};

function getCurrentShapeSize(size: number) {
  return size >= GridstackBreakpoints.large
    ? 'lg'
    : size >= GridstackBreakpoints.medium
    ? 'md'
    : 'sm';
}
