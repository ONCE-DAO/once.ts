// ##IGNORE_TRANSFORMER##

import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { EMPTY_NAME, EMPTY_NAMESPACE } from "../1_infrastructure/Constants.mjs";
import NpmPackage from "../3_services/NpmPackage.interface.mjs";

export class DefaultNpmPackage implements NpmPackage {
  main: string | undefined;
  onceDependencies?: string[] | undefined;
  path?: string;
  name: string = EMPTY_NAME;
  version?: string;
  namespace: string = EMPTY_NAMESPACE;
  linkPackage?: boolean;
  scripts?: any;
  devDependencies?: any

  static getByFolder(path: string): DefaultNpmPackage {
    return this.getByPath(join(path, "package.json"));
  }

  static getByPath(path: string): DefaultNpmPackage {
    if (!existsSync(path)) return new DefaultNpmPackage();
    const npmPackage: DefaultNpmPackage = JSON.parse(readFileSync(path).toString());
    npmPackage.path = path;
    return npmPackage;
  }
}
