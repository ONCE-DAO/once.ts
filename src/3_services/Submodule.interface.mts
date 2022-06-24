import EAMD from "./EAMD.interface.mjs";
import NpmPackage from "./NpmPackage.interface.mjs";

export default interface Submodule {
  name: string;
  path: string;
  url: string;
  branch: string;
  package: NpmPackage;
  distributionFolder: string;
  initNewComponent(): Promise<void>;
  installDependencies(): Promise<void>;
  build(watch?: boolean): Promise<void>;
  linkNodeModules(): Promise<void>;
  updateTsConfig(scenariosPath: string): Promise<void>;
  updateBranchToCheckoutVersion(eamd: EAMD): Promise<void>
  // afterbuild(): void;
  watch(): Promise<void>;
  discoverFiles(): string[];
  basePath: string;
  // init(config: { path?: string, url?: string, branch?: string }): Promise<Submodule>;
  // addFromRemoteUrl(args: AddSubmoduleArgs): Promise<Submodule>;
}

export interface SubmoduleStatic<T> {
  new(): T;
  getInstance(): T;
}

export type AddSubmoduleArgs = {
  url: string;
  branch?: string;
  overwrite?: { name: string; namespace: string };
};
