import { create } from 'zustand';
import packageJson from 'package.json';

// Add an environment attribute with the values 'development' | 'production' | 'test'
interface PackageAttributesState {
  attributes: typeof packageJson & { environment: 'development' | 'production' | 'test' };
  setInitialPackageAttributes: (attributes: typeof packageJson) => void;
}

export const usePackageAttributesStore = create<PackageAttributesState>((set) => ({
  attributes: {
    ...packageJson,
    environment: process.env.NODE_ENV as 'development' | 'production' | 'test',
  },
  setInitialPackageAttributes: (attributes) =>
    set({
      attributes: {
        ...attributes,
        environment: process.env.NODE_ENV as 'development' | 'production' | 'test',
      },
    }),
}));
