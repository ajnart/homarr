import create from 'zustand';

import { ServerSidePackageAttributesType } from '../../server/getPackageVersion';

interface PackageAttributesState {
  attributes: ServerSidePackageAttributesType;
  setInitialPackageAttributes: (attributes: ServerSidePackageAttributesType) => void;
}

export const usePackageAttributesStore = create<PackageAttributesState>((set) => ({
  attributes: { packageVersion: undefined, environment: 'test' },
  setInitialPackageAttributes(attributes) {
    set((state) => ({ ...state, attributes }));
  },
}));
