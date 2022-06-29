import Buildable from "../../3_services/Build/Buildable.interface.mjs";
import ComponentBuilder from "../../3_services/Build/BuildComponent.interface.mjs";
import GitRepositoryInterface from "../../3_services/Build/Git/GitRepository.interface.mjs";
import SubmoduleInterface from "../../3_services/Build/Git/GitSubmodule.interface.mjs";
import NpmPackageInterface, { BuildableNpmPackage } from "../../3_services/Build/Npm/NpmPackage.interface.mjs";
import TypescriptProjectInterface from "../../3_services/Build/Typescript/TypescriptProject.interface.mjs";
import DefaultGitRepository from "./Git/GitRepository.class.mjs";
import DefaultNpmPackage from "./Npm/NpmPackage.class.mjs";
import DefaultTypescriptProject from "./Typescript/TypescriptProject.class.mjs";

export default class DefaultComponentBuilder implements ComponentBuilder {
    path: string;
    gitRepository: GitRepositoryInterface;
    submodule: SubmoduleInterface & Buildable;
    npmPackage: NpmPackageInterface & Buildable;
    typescriptProject: TypescriptProjectInterface;
    get buildables() {
        return [this.npmPackage, this.submodule, this.typescriptProject]
    }

    private constructor(path: string, gitRepository: GitRepositoryInterface, submodule: SubmoduleInterface & Buildable, npmPackage: BuildableNpmPackage, typescriptProject: TypescriptProjectInterface) {
        this.path = path;
        this.gitRepository = gitRepository;
        this.submodule = submodule;
        this.npmPackage = npmPackage;
        this.typescriptProject = typescriptProject;
    }

    install = async () => this.buildables.forEach(async (buildable) => await buildable.install())
    beforeBuild = async () => this.buildables.forEach(async (buildable) => await buildable.beforeBuild())
    build = async () => this.buildables.forEach(async (buildable) => await buildable.build())
    afterBuild = async () => this.buildables.forEach(async (buildable) => await buildable.afterBuild())

    static async init(submodule: SubmoduleInterface & Buildable): Promise<ComponentBuilder> {
        const gitRepository = await DefaultGitRepository.init(submodule.path)
        const npmPackage = DefaultNpmPackage.init(submodule.path, "fallbackName", gitRepository.branch, submodule.branch) as DefaultNpmPackage
        const typescriptProject = await DefaultTypescriptProject.init(submodule.path)
        return new DefaultComponentBuilder(submodule.path, gitRepository, submodule, npmPackage, typescriptProject)
    }

    get name(): string {
        return this.npmPackage.name;
    }

    get namespace(): string {
        return this.npmPackage.namespace;
    }

    get version(): string {
        return this.gitRepository.branch
    }
}