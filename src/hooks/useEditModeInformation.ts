import { create } from 'zustand';

interface EditModeInformationStore {
  editModeEnabled: boolean;
  setEnabled: () => void;
}

export const useEditModeInformationStore = create<EditModeInformationStore>((set) => ({
  editModeEnabled: false,
  setEnabled: () => set(() => ({ editModeEnabled: true })),
}));
