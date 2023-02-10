import { create } from 'zustand';

import { ServerSidePackageAttributesType } from '../../server/getPackageVersion';

interface PackageAttributesState {
  attributes: ServerSidePackageAttributesType;
  setInitialPackageAttributes: (attributes: ServerSidePackageAttributesType) => void;
}

export const usePackageAttributesStore = create<PackageAttributesState>(
  (set: (arg0: (state: any) => any) => void) => ({
    attributes: { packageVersion: undefined, environment: 'test', dependencies: {} },
    setInitialPackageAttributes(attributes: any) {
      set((state) => ({ ...state, attributes }));
    },
  })
);
