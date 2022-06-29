import Buildable from "./Buildable.interface.mjs";
import GitRepository from "./Git/GitRepository.interface.mjs";
import GitSubmodule from "./Git/GitSubmodule.interface.mjs";
import NpmPackage from "./Npm/NpmPackage.interface.mjs";
import TypescriptProject from "./Typescript/TypescriptProject.interface.mjs";

export default interface ComponentBuilder extends Buildable {
    name: string;
    //TODO later create classes for namespace, version, snapshot
    namespace: string; //TODO rename in package and explain
    version: string;
    path: string;
    gitRepository: GitRepository;
    submodule: GitSubmodule;
    npmPackage: NpmPackage;
    typescriptProject: TypescriptProject;
    buildables: Buildable[]
}