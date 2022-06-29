import GitSubmodule from "./GitSubmodule.interface.mjs";

export default interface GitRepository {
  path: string;
  remoteUrl: string;
  branch: string;

  checkout(branch: string): Promise<void>;
  updateSubmodules(): void

  getSubmodules(submoduleInit: (path: string) => Promise<GitSubmodule>): Promise<GitSubmodule[]>

  // getSubmodules(
  //   submoduleConstructor: (
  //     name: string,
  //     path: string,
  //     url: string,
  //     branch: string,
  //     { baseDir, clone, init }: GitRepositoryParameter
  //   ) => Promise<GitSubmodule & GitRepository>
  // ): Promise<(GitSubmodule & GitRepository)[]>;
}

export enum GIT_REPOSITORY_CONSTANTS {
  NOT_INITIALIZED = "GitRepository wasn't initalized",
  NOT_A_REPO = "path is not a git repository",
}

export type GitCloneParameter = {
  url: string;
  branch?: string;
};

export type GitRepositoryParameter = {
  baseDir: string;
  clone?: GitCloneParameter;
  init?: boolean;
};

export class NotAGitRepositoryError extends Error {
  message = GIT_REPOSITORY_CONSTANTS.NOT_A_REPO
}