import Buildable from "../Buildable.interface.mjs";
import GitSubmodule from "./GitSubmodule.interface.mjs";

export default interface GitRepository extends Buildable{
  path: string;
  remoteUrl: string;
  branch: string;
  checkout(branch: string): Promise<void>;
  updateSubmodules(): Promise<void>
  getSubmodules(submoduleInit: (path: string) => Promise<GitSubmodule>): Promise<GitSubmodule[]>
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