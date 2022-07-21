import { execSync } from "child_process";
import BuildConfig from "../../../3_services/Build/BuildConfig.interface.mjs";
import TypescriptProject from "../../../3_services/Build/Typescript/TypescriptProject.interface.mjs";
import DefaultTranspiler from "./Transpiler.class.mjs";

import { install } from 'ts-patch';
import NpmPackageInterface from "../../../3_services/Build/Npm/NpmPackage.interface.mjs";
import { join, relative } from "path";

export default class DefaultTypescriptProject implements TypescriptProject {
    private path: string;
    name: string;
    namespace: string;
    version: string;

    private get fullQualifiedNamespace() { return `${this.namespace}.${this.name}[${this.version}]` }

    constructor(path: string, name: string, namespace: string, version: string) {
        this.path = path;
        this.name = name;
        this.namespace = namespace;
        this.version = version;
    }

    static async init(path: string, name: string, namespace: string, version: string): Promise<TypescriptProject> {
        return new DefaultTypescriptProject(path, name, namespace, version);
    }

    async install(config: BuildConfig): Promise<void> {
    }

    async beforeBuild(config: BuildConfig): Promise<void> {
        install({ dir: this.path });
        //execSync("npx ts-patch i", { cwd: this.path, stdio: "inherit" });
    }

    async build(config: BuildConfig, distributionFolder: string, npmPackage: NpmPackageInterface): Promise<void> {
        console.group(`DefaultTypescriptProject build ${this.fullQualifiedNamespace} [${import.meta.url}]"`);

        const transpiler = await DefaultTranspiler.init(this.path, config, this.fullQualifiedNamespace, npmPackage)
        const files = await transpiler.transpile()
        await transpiler.writeTsConfigPaths(files, this.name, this.namespace, this.version)
        await transpiler.writeTsConfigBuildPaths(files, this.name, this.namespace, this.version)
        let descriptor = await transpiler.initComponentDescriptor(this.name, this.namespace, this.version, files)

        // Create Index File 
        await transpiler.writeSourceIndexFile();
        let indexFiles = await transpiler.transpileIndex();
        descriptor.addUnitFiles(indexFiles.map(path => join(".", relative(config.distributionFolder, path))));

        await transpiler.writeComponentDescriptor(this.name)

        transpiler.symLinkDistributionFolder()

        console.groupEnd();
        console.log("DefaultTypescriptProject build done");
    }

    async watch(config: BuildConfig, distributionFolder: string, npmPackage: NpmPackageInterface): Promise<void> {
        console.group(`DefaultTypescriptProject watch ${this.fullQualifiedNamespace} [${import.meta.url}]"`);

        const transpiler = await DefaultTranspiler.init(this.path, config, `${this.namespace}.${this.name}[${this.version}]`, npmPackage)
        await transpiler.watch(async (files: string[]) => {
            await transpiler.writeTsConfigPaths(files, this.name, this.namespace, this.version)
            await transpiler.writeTsConfigBuildPaths(files, this.name, this.namespace, this.version)
            await transpiler.writeComponentDescriptor(this.name)
            await transpiler.writeSourceIndexFile();
            await transpiler.transpileIndex();
        })
        transpiler.symLinkDistributionFolder()


        console.groupEnd();
        console.log("DefaultTypescriptProject watch done");
    }
}