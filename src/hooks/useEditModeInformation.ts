import { create } from 'zustand';

interface EditModeInformationStore {
  editModeEnabled: boolean;
  setState: (enabled: boolean) => void;
}

export const useEditModeInformationStore = create<EditModeInformationStore>((set) => ({
  editModeEnabled: false,
  setState: (enabled) => set({ editModeEnabled: enabled }),
}));
