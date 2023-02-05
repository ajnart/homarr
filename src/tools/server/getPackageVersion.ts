import packageJson from '../../../package.json';

const getServerPackageVersion = (): string | undefined => packageJson.version;

const getServerNodeEnvironment = (): 'development' | 'production' | 'test' => process.env.NODE_ENV;

const getDependencies = (): PackageJsonDependencies => packageJson.dependencies;

export const getServiceSidePackageAttributes = (): ServerSidePackageAttributesType => {
  const result = {
    packageVersion: getServerPackageVersion(),
    environment: getServerNodeEnvironment(),
    dependencies: getDependencies(),
  } as ServerSidePackageAttributesType;
  return result;
};

export type ServerSidePackageAttributesType = {
  packageVersion: string | undefined;
  environment: 'development' | 'production' | 'test';
  dependencies: PackageJsonDependencies;
};

type PackageJsonDependencies = { [key in string]: string };
