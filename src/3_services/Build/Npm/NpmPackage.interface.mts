import Buildable from "../Buildable.interface.mjs";
import { CustomPackageJson } from "./CustomPackageJson.type.mjs";

export default interface NpmPackage extends Buildable {
  name: string;
  path: string;
  packageJson: CustomPackageJson
}

export interface BuildableNpmPackage extends NpmPackage, Buildable { }
export enum NPM_PACKAGE_CONSTANTS {
  PACKAGE_JSON_FILE = "package.json",
  NODE_MODULES="node_modules"
}

export class NotAnNpmPackage extends Error { constructor(path: string) { super(`${path} is not containing a package.json file`) } }