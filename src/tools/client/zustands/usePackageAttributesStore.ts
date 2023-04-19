import { create } from 'zustand';
import packageJson from 'package.json';
import { ServerSidePackageAttributesType } from '../../server/getPackageVersion';

interface PackageAttributesState {
  attributes: ServerSidePackageAttributesType;
  setInitialPackageAttributes: (attributes: ServerSidePackageAttributesType) => void;
}

export const usePackageAttributesStore = create<PackageAttributesState>((set) => ({
  attributes: {
    packageVersion: packageJson.version,
    environment: process.env.NODE_ENV,
    dependencies: packageJson.dependencies,
  },
  setInitialPackageAttributes(attributes) {
    set((state) => ({ ...state, attributes }));
  },
}));
