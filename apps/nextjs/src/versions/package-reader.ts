import fsPromises from "fs/promises";
import { glob } from "glob";

import packageJson from "../../../../package.json";

const getPackageVersion = () => packageJson.version;
const getDependenciesAsync = async (): Promise<PackageJsonDependencies> => {
  const pathNames = await glob("**/package.json", {
    ignore: "node_modules/**",
    cwd: "../../",
    absolute: true,
  });
  const packageContents = await Promise.all(pathNames.map(async (path) => await fsPromises.readFile(path, "utf-8")));
  const packageDependencies = packageContents
    .map((packageContent) => (JSON.parse(packageContent) as PackageJson).dependencies)
    .filter((dependencies) => dependencies !== undefined);

  let dependencies = {};
  for (const dependenciesOfPackage of packageDependencies) {
    dependencies = { ...dependencies, ...dependenciesOfPackage };
  }
  return dependencies;
};

export const getPackageAttributesAsync = async () => {
  return {
    version: getPackageVersion(),
    dependencies: await getDependenciesAsync(),
  };
};

type PackageJsonDependencies = Record<string, string>;
interface PackageJson {
  dependencies: PackageJsonDependencies | undefined;
}
