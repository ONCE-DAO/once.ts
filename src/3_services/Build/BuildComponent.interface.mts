import GitRepository from "./Git/GitRepository.interface.mjs";
import GitSubmodule from "./Git/GitSubmodule.interface.mjs";
import NpmPackage from "./Npm/NpmPackage.interface.mjs";

export default interface ComponentBuilder {
    name: string;
    namespace: string;
    version: string;
    path: string;
    gitRepository: GitRepository;
    submodule: GitSubmodule;
    npmPackage: NpmPackage;
}