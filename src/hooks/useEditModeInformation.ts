import { create } from 'zustand';

interface EditModeInformationStore {
  editModeEnabled: boolean;
  setEditModeDisabled: (enabled: boolean) => void;
}

export const useEditModeInformationStore = create<EditModeInformationStore>((set) => ({
  editModeEnabled: false,
  setEditModeDisabled: (enabled) => set({ editModeEnabled: enabled }),
}));
