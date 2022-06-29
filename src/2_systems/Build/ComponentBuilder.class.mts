import ComponentBuilder from "../../3_services/Build/BuildComponent.interface.mjs";
import GitRepositoryInterface from "../../3_services/Build/Git/GitRepository.interface.mjs";
import SubmoduleInterface from "../../3_services/Build/Git/GitSubmodule.interface.mjs";
import NpmPackageInterface from "../../3_services/Build/Npm/NpmPackage.interface.mjs";
import DefaultGitRepository from "./Git/GitRepository.class.mjs";
import DefaultNpmPackage from "./Npm/NpmPackage.class.mjs";

export default class DefaultComponentBuilder implements ComponentBuilder {
    path: string;
    gitRepository: GitRepositoryInterface;
    submodule: SubmoduleInterface;
    npmPackage: NpmPackageInterface;

    private constructor(path: string, gitRepository: GitRepositoryInterface, submodule: SubmoduleInterface, npmPackage: NpmPackageInterface) {
        this.path = path;
        this.gitRepository = gitRepository;
        this.submodule = submodule;
        this.npmPackage = npmPackage;
    }

    static async init(submodule: SubmoduleInterface): Promise<ComponentBuilder> {
        const gitRepository = await DefaultGitRepository.init(submodule.path)
        const npmPackage = DefaultNpmPackage.init(submodule.path, "fallbackName", gitRepository.branch, submodule.branch)
        return new DefaultComponentBuilder(submodule.path, gitRepository, submodule, npmPackage)
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