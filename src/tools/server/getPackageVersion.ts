const getServerPackageVersion = (): string | undefined => process.env.npm_package_version;

const getServerNodeEnvironment = (): 'development' | 'production' | 'test' =>
  process.env.NODE_ENV;

export const getServiceSidePackageAttributes = (): ServerSidePackageAttributesType => ({
  packageVersion: getServerPackageVersion(),
  environment: getServerNodeEnvironment(),
});

export type ServerSidePackageAttributesType = {
  packageVersion: string | undefined;
  environment: 'development' | 'production' | 'test';
};
