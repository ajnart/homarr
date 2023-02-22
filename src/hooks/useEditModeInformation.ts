import { create } from 'zustand';

interface EditModeInformationStore {
  editModeEnabled: boolean;
  setDisabled: () => void;
}

export const useEditModeInformationStore = create<EditModeInformationStore>((set) => ({
  editModeEnabled: false,
  setDisabled: () => set(() => ({ editModeEnabled: true })),
}));
