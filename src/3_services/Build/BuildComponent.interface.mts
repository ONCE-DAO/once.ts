import Buildable from "./Buildable.interface.mjs";
import BuildConfig from "./BuildConfig.interface.mjs";
import GitSubmodule from "./Git/GitSubmodule.interface.mjs";
import NpmPackage from "./Npm/NpmPackage.interface.mjs";
import TypescriptProject from "./Typescript/TypescriptProject.interface.mjs";

export default interface ComponentBuilder {
    name: string;
    //TODO later create classes for namespace, version, snapshot
    namespace: string; //TODO rename in package and explain
    version: string;
    path: string;
    submodule: GitSubmodule;
    npmPackage: NpmPackage;
    typescriptProject: TypescriptProject;
    buildables: Buildable[];
    distributionFolder: string
    install(config: BuildConfig): Promise<void>
    beforeBuild(config: BuildConfig): Promise<void>
    build(config: BuildConfig): Promise<void>
    watch(config: BuildConfig): Promise<void>
}