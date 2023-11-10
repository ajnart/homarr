import { createWithEqualityFn } from 'zustand/traditional';

interface EditModeState {
  enabled: boolean;
  toggleEditMode: () => void;
}

export const useEditModeStore = createWithEqualityFn<EditModeState>(
  (set) => ({
    enabled: false,
    toggleEditMode: () => set((state) => ({ enabled: !state.enabled })),
  }),
  Object.is
);
