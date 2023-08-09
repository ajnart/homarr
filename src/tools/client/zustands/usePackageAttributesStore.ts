import { createWithEqualityFn } from 'zustand/traditional';

import { ServerSidePackageAttributesType } from '../../server/getPackageVersion';

interface PackageAttributesState {
  attributes: ServerSidePackageAttributesType;
  setInitialPackageAttributes: (attributes: ServerSidePackageAttributesType) => void;
}

export const usePackageAttributesStore = createWithEqualityFn<PackageAttributesState>(
  (set) => ({
    attributes: { packageVersion: undefined, environment: 'test', dependencies: {} },
    setInitialPackageAttributes(attributes) {
      set((state) => ({ ...state, attributes }));
    },
  }),
  Object.is
);
