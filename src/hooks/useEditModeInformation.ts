import { create } from 'zustand';

interface EditModeInformationStore {
  isEditModeDisabled: boolean;
  setDisabled: () => void;
}

export const useEditModeInformationStore = create<EditModeInformationStore>((set) => ({
  isEditModeDisabled: false,
  setDisabled: () => set(() => ({ isEditModeDisabled: true })),
}));
