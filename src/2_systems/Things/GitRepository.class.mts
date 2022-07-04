import { execSync } from "child_process";
import simpleGit, { SimpleGit } from "simple-git";
import GitRepository, {
  GitRepositoryParameter,
  NotAGitRepositoryError,
} from "../../3_services/GitRepository.interface.mjs";
import Submodule from "../../3_services/Submodule.interface.mjs";
// import DefaultSubmodule from "./Submodule.class.mjs";

export class DefaultGitRepository implements GitRepository {
  folderPath: string = "";
  currentBranch: string;
  remoteUrl: string;
  protected gitRepository: SimpleGit;

  static async init({
    baseDir,
    clone,
    init,
  }: GitRepositoryParameter): Promise<GitRepository> {
    const gitRepository = simpleGit(baseDir, { binary: "git" });

    if (!(await gitRepository.checkIsRepo()))
      throw new NotAGitRepositoryError();

    return new DefaultGitRepository(
      gitRepository,
      await this.getBranch(gitRepository),
      await this.getRemoteUrl(gitRepository),
      baseDir
    );
  }

  protected static async getRemoteUrl(gitRepository: SimpleGit): Promise<string> {
    const config = await gitRepository.getConfig("remote.origin.url");
    return config.value || "";
  }

  protected static async getBranch(gitRepository: SimpleGit): Promise<string> {
    const status = await gitRepository.status();
    return status.current || "";
  }

  protected constructor(
    gitRepo: SimpleGit,
    branch: string,
    remoteUrl: string,
    folderPath: string
  ) {
    this.gitRepository = gitRepo;
    this.currentBranch = branch;
    this.remoteUrl = remoteUrl;
    this.folderPath = folderPath;
  }

  updateSubmodules() {
    execSync("git submodule update --init --remote --recursive", {
      stdio: "inherit",
      cwd: this.folderPath
    })
  }

  async getSubmodules(
    initSubmodule: (
      name: string,
      path: string,
      url: string,
      branch: string,
      { baseDir, clone, init }: GitRepositoryParameter
    ) => Promise<Submodule & GitRepository>
  ): Promise<(Submodule & GitRepository)[]> {


    const submodules: (Submodule & GitRepository)[] = [];
    const modules = execSync("git submodule foreach --quiet 'echo $name'", {
      encoding: "utf8",
      cwd: this.folderPath
    })
      .split("\n")
      .filter((e) => e);

    for (let module of modules) {
      const ignore =
        (await this.getSubmoduleValue(`submodule.${module}.ignore`)) === "true";
      if (ignore) continue;
      const branch = await this.getSubmoduleValue(`submodule.${module}.branch`);

      submodules.push(
        await initSubmodule(
          module.replace(`@${branch}`, ""),
          await this.getSubmoduleValue(`submodule.${module}.path`),
          await this.getSubmoduleValue(`submodule.${module}.url`),
          branch,
          { baseDir: this.folderPath }
        )
      );
    }
    return submodules;
  }

  async checkout(branch: string): Promise<void> {
    execSync(`git checkout ${branch}`, {
      stdio: "inherit",
      cwd: this.folderPath,
    });
  }

  protected async getSubmoduleValue(key: string): Promise<string> {
    const rawResult = await this.gitRepository.raw(
      "config",
      "--file",
      ".gitmodules",
      "--get",
      key
    );
    return rawResult.replace(/\n$/, "");
  }
}
