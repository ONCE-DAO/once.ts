import { CustomPackageJson } from "./CustomPackageJson.type.mjs";

export default interface NpmPackage {
  name: string;
  namespace: string;
  path: string;
  packageJson: CustomPackageJson
}
export enum NPM_PACKAGE_CONSTANTS {
  PACKAGE_JSON_FILE = "package.json",
}

export class NotAnNpmPackage extends Error { constructor(path: string) { super(`${path} is not containing a package.json file`) } }