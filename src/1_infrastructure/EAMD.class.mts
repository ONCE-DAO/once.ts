import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import simpleGit, { SimpleGit } from "simple-git";
import { DefaultGitRepository } from "../2_systems/GitRepository.class.mjs";
import DefaultScenario from "../2_systems/Scenario.class.mjs";
import DefaultSubmodule from "../2_systems/Submodule.class.mjs";
import EAMD from "../3_services/EAMD.interface.mjs";
import GitRepository from "../3_services/GitRepository.interface.mjs";
import Scenario from "../3_services/Scenario.interface.mjs";
import Submodule from "../3_services/Submodule.interface.mjs";

type GitRepositorySubmodule = GitRepository & Submodule;

export default class DefaultEAMD extends DefaultGitRepository implements EAMD {
  eamdDirectory: string;
  scenario: Scenario;

  static async getInstance(scenario: DefaultScenario): Promise<EAMD> {
    const gitRepository = simpleGit(scenario.eamdPath, { binary: "git" });
    const branch = await DefaultEAMD.getBranch(gitRepository)
    const remoteUrl = await DefaultEAMD.getRemoteUrl(gitRepository)
    const eamd = new DefaultEAMD(scenario, gitRepository, branch, remoteUrl)
    return eamd;
  }

  constructor(scenario: Scenario, gitRepository: SimpleGit, branch: string, remoteUrl: string) {
    super(gitRepository, branch, remoteUrl, scenario.eamdPath)
    this.eamdDirectory = scenario.eamdPath;
    this.scenario = scenario;
  }

  async discover(): Promise<{ [i: string]: string }> {

    const configFile = "tsconfigPaths.json"
    if (!existsSync(configFile)) throw new Error("missing " + configFile)
    let paths = JSON.parse(readFileSync(configFile).toString()).compilerOptions.paths as { [i: string]: string[] };

    let result: { [i: string]: string } = {};
    for (const key of Object.keys(paths)) {
      const path = paths[key].filter(x => x.endsWith(".mjs"))
      if (path.length > 0) {
        result[key] = path[0];
      }
    }
    return result


  }


  async build(watch: boolean = false): Promise<void> {
    const submodules = await this.getSortedSubmodules();
    await this.createPathsConfig(submodules);



    for (let sub of submodules) {

      //await sub.initNewComponent();

      await sub.updateTsConfig(this.scenario.scenarioPath)
      console.log(`run build for ${sub.name}@${sub.branch}`);
      await sub.linkNodeModules();
      console.log("node_modules link");

      await sub.build(watch);
    }
  }

  private async createPathsConfig(submodules?: GitRepositorySubmodule[]) {
    if (submodules === undefined) {
      submodules = await this.getSortedSubmodules();
    }
    const fileName = "tsconfigPaths.json"

    let data = {
      "compilerOptions": {
        "baseUrl": ".",
        "paths": {} as { [key: string]: string[] }
      }
    };

    for (const submodule of submodules) {
      const ior = `ior:esm:/${submodule.package.namespace}.${submodule.package.name}[${submodule.branch}]`;
      if (submodule.package.main === undefined) throw new Error("Missing main in Package.json in " + submodule.folderPath);
      let modulePath = join(submodule.distributionFolder, submodule.package.main.replace("dist/", ""));
      const value: string[] = [modulePath];

      if (submodule.package.types !== undefined) {
        value.unshift(join(submodule.distributionFolder, submodule.package.types));
      } else if (submodule.package.main.endsWith('.mjs')) {
        value.unshift(join(submodule.distributionFolder, submodule.package.main.replace("dist/", "").replace(/\.m[jt]s$/, '.d.mts')));
      }
      data.compilerOptions.paths[ior] = value;
    }

    writeFileSync(fileName, JSON.stringify(data, null, 2), { encoding: 'utf8' });

  }

  async runForSubmodules(fn: (submodule: GitRepositorySubmodule) => Promise<void>): Promise<void> {
    for (let sub of await this.getSortedSubmodules()) {
      await fn(sub)
    }
  }

  private getDistributionFolderFor(sub: GitRepositorySubmodule): string {
    return join(this.scenario.scenarioPath, ...sub.package.namespace.split("."), sub.package.name, sub.branch)
  }

  private async getSortedSubmodules(): Promise<GitRepositorySubmodule[]> {
    const submodules = (await this.getSubmodules(DefaultSubmodule.initSubmodule))
      .sort(DefaultSubmodule.ResolveDependencies)
      .filter(x => !x.folderPath.includes("3rdParty"))
    submodules.
      forEach(sub => {
        sub.distributionFolder = this.getDistributionFolderFor(sub)
        return sub
      })
    return submodules
  }
}
