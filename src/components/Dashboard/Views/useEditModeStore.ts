import create from 'zustand';

interface EditModeState {
  enabled: boolean;
  toggleEditMode: () => void;
}

export const useEditModeStore = create<EditModeState>((set) => ({
  enabled: false,
  toggleEditMode: () => set((state) => ({ enabled: !state.enabled })),
}));
