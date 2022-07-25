import BuildConfig from "../../../3_services/Build/BuildConfig.interface.mjs";
import TypescriptProject from "../../../3_services/Build/Typescript/TypescriptProject.interface.mjs";
import DefaultTranspiler from "./Transpiler.class.mjs";

import { install } from 'ts-patch';
import NpmPackageInterface from "../../../3_services/Build/Npm/NpmPackage.interface.mjs";
import { join, relative } from "path";
import { existsSync, mkdirSync } from "fs";
import ExtendedPromise from "../../../2_systems/Promise.class.mjs";
import { fork } from "child_process";

export default class DefaultTypescriptProject implements TypescriptProject {
    private path: string;
    name: string;
    namespace: string;
    version: string;

    private get fullQualifiedNamespace() { return `${this.namespace}.${this.name}[${this.version}]` }

    private requireOwnBuildProcess: boolean = false;

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
        if (config.fastRun === false) {
            // this.requireOwnBuildProcess = install({ dir: this.path });
        }
        //config.requireOwnBuildProcess = true;
        //execSync("npx ts-patch i", { cwd: this.path, stdio: "inherit" });
    }

    private async asyncBuildRun(config: BuildConfig): Promise<void> {

        const controller = new AbortController();
        const { signal } = controller;
        let promiseHandler = ExtendedPromise.createPromiseHandler();
        let cmdArguments = ['--buildPath=' + this.path, 'fast'];
        if (config.ignoreErrors) cmdArguments.push('ignoreErrors')
        const child = fork(process.argv[1], cmdArguments, { signal });


        child.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
            if (code != 0) {
                promiseHandler.setError(new Error(`Child Build process '${this.path}' exited with code ${code}`));
            } else {
                promiseHandler.setSuccess();
            }
        });

        return promiseHandler.promise;
    }

    async build(config: BuildConfig, distributionFolder: string, npmPackage: NpmPackageInterface): Promise<void> {
        if (this.requireOwnBuildProcess) {
            return await this.asyncBuildRun(config);
        }

        console.group(`DefaultTypescriptProject build ${this.fullQualifiedNamespace}`); //[${import.meta.url}]

        if (!existsSync(config.distributionFolder)) {
            mkdirSync(config.distributionFolder, { recursive: true });
        }

        const transpiler = await DefaultTranspiler.init(this.path, config, this.fullQualifiedNamespace, npmPackage)
        const files = await transpiler.transpile()
        await transpiler.writeTsConfigPaths(files, this.name, this.namespace, this.version)
        let descriptor = await transpiler.initComponentDescriptor(this.name, this.namespace, this.version, files)

        // Create Index File 
        await transpiler.writeSourceIndexFile();
        let indexFiles = await transpiler.transpileIndex();
        descriptor.addUnitFiles(indexFiles.map(path => join(".", relative(config.distributionFolder, path))));

        await transpiler.writeTsConfigBuildPaths(indexFiles, this.name, this.namespace, this.version)

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
            let descriptor = await transpiler.initComponentDescriptor(this.name, this.namespace, this.version, files)

            // Create Index File 
            await transpiler.writeSourceIndexFile();
            let indexFiles = await transpiler.transpileIndex();
            descriptor.addUnitFiles(indexFiles.map(path => join(".", relative(config.distributionFolder, path))));

            await transpiler.writeTsConfigBuildPaths(indexFiles, this.name, this.namespace, this.version)

            await transpiler.writeComponentDescriptor(this.name);
        })
        transpiler.symLinkDistributionFolder()


        console.groupEnd();
        console.log("DefaultTypescriptProject watch done");
    }
}