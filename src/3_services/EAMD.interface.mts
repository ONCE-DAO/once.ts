import GitRepository from "./GitRepository.interface.mjs";
import Scenario from "./Scenario.interface.mjs";
import Submodule from "./Submodule.interface.mjs";

export default interface EAMD extends GitRepository {
  eamdDirectory: string;
  build(watch?: boolean): Promise<void>
  scenario: Scenario

  runForSubmodules(fn: (submodule: Submodule & GitRepository) => Promise<void>): Promise<void>
  // installedAt: Date | undefined;
  // preferredFolder: string[];

  //   install(): Promise<EAMD>;
  //   hasWriteAccess(): boolean;
  //   isInstalled(): boolean;
  //   getInstalled(): Promise<EAMD>;
  //   init(path: string): EAMD;
  //   update(): Promise<EAMD>;
  //   test(): void;
  //   discover(): Promise<Object>;
  //   getInstallDirectory(): string | undefined;
  discover(): Promise<{ [i: string]: string }>;
}


export enum EAMD_FOLDERS {
  ROOT = "EAMD.ucp",
  COMPONENTS = "Components",
  SCENARIOS = "Scenarios",
  MISSING_NAMESPACE = "MISSING_NAMESPACE"
}
