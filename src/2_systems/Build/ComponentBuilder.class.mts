import { join } from "path";
import Buildable from "../../3_services/Build/Buildable.interface.mjs";
import ComponentBuilder from "../../3_services/Build/BuildComponent.interface.mjs";
import BuildConfig from "../../3_services/Build/BuildConfig.interface.mjs";
import SubmoduleInterface from "../../3_services/Build/Git/GitSubmodule.interface.mjs";
import NpmPackageInterface, { BuildableNpmPackage } from "../../3_services/Build/Npm/NpmPackage.interface.mjs";
import TypescriptProjectInterface from "../../3_services/Build/Typescript/TypescriptProject.interface.mjs";
import DefaultNpmPackage from "./Npm/NpmPackage.class.mjs";
import DefaultTypescriptProject from "./Typescript/TypescriptProject.class.mjs";

export default class DefaultComponentBuilder implements ComponentBuilder {
    path: string;

    submodule: SubmoduleInterface;
    npmPackage: NpmPackageInterface;
    typescriptProject: TypescriptProjectInterface;
    
    distributionFolder: string

    get buildables() {
        return [this.npmPackage, this.submodule, this.typescriptProject]
    }

    private constructor(path: string, submodule: SubmoduleInterface & Buildable, npmPackage: BuildableNpmPackage, typescriptProject: TypescriptProjectInterface, buildConfig: BuildConfig) {
        this.path = path;
        this.submodule = submodule;
        this.npmPackage = npmPackage;
        this.typescriptProject = typescriptProject;
        this.distributionFolder = join(buildConfig.scenario.scenarioPath, ...submodule.namespace.split("."), submodule.name, submodule.branch)
    }

    install = async (config: BuildConfig) => this.buildables.forEach(async (buildable) => await buildable.install(config, this.distributionFolder))
    beforeBuild = async (config: BuildConfig) => this.buildables.forEach(async (buildable) => await buildable.beforeBuild(config, this.distributionFolder))
    build = async (config: BuildConfig) => this.buildables.forEach(async (buildable) => await buildable.build(config, this.distributionFolder))
    afterBuild = async (config: BuildConfig) => this.buildables.forEach(async (buildable) => await buildable.afterBuild(config, this.distributionFolder))

    static async init(submodule: SubmoduleInterface, buildConfig: BuildConfig): Promise<ComponentBuilder> {

        const npmPackage = DefaultNpmPackage.init(submodule.path, submodule.name, submodule.namespace, submodule.branch) as DefaultNpmPackage
        const typescriptProject = await DefaultTypescriptProject.init(submodule.path)

        return new DefaultComponentBuilder(submodule.path, submodule, npmPackage, typescriptProject, buildConfig)
    }

    get name(): string {
        return this.submodule.name || this.npmPackage.name;
    }

    get namespace(): string {
        return this.submodule.namespace;
    }

    get version(): string {
        return this.submodule.branch
    }
}