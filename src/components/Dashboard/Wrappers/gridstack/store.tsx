import { useMantineTheme } from '@mantine/core';
import create from 'zustand';

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

export const useWrapperColumnCount = () => {
  const mainAreaWidth = useGridstackStore((x) => x.mainAreaWidth);
  const { sm, xl } = useMantineTheme().breakpoints;
  if (!mainAreaWidth) return null;

  if (mainAreaWidth >= xl) return 12;

  if (mainAreaWidth >= sm) return 6;

  return 3;
};

function getCurrentShapeSize(size: number) {
  return size >= 1400 ? 'lg' : size >= 768 ? 'md' : 'sm';
}
