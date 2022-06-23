import Submodule from "./Submodule.interface.mjs";

export default interface GitRepository {
  // identifier: Promise<string>;
  folderPath: string;
  currentBranch: string;
  remoteUrl: string;
  checkout(branch: string): Promise<void>;

  // getAndInstallSubmodule(repoPath: string, path: string): Promise<Submodule>;
  // addSubmodule(repoToAdd: GitRepository): Promise<Submodule>;
  updateSubmodules():void
  getSubmodules(
    submoduleConstructor: (
      name: string,
      path: string,
      url: string,
      branch: string,
      { baseDir, clone, init }: GitRepositoryParameter
    ) => Promise<Submodule & GitRepository>
  ): Promise<(Submodule & GitRepository)[]>;
  // init({
  //   baseDir,
  //   clone,
  //   init,
  // }: GitRepositoryParameter): Promise<GitRepository>;
}

export class GitRepositoryConstants {
  static readonly NOTINITIALIZED = "GitRepository wasn't initalized";
  static readonly NOTAREPO = "path is not a git repository";
}

export class NotAGitRepositoryError extends Error {
  constructor() {
    super(GitRepositoryConstants.NOTAREPO);
  }
}

// export class GitRepositoryNotInitialisedError extends Error {
//   constructor() {
//     super(GitRepositoryConstants.NOTINITIALIZED);
//   }
// }

export type GitCloneParameter = {
  url: string;
  branch?: string;
};

export type GitRepositoryParameter = {
  baseDir: string;
  clone?: GitCloneParameter;
  init?: boolean;
};

// export type Result = {
//   sucess: boolean;
//   errorMessage?: string;
// };
