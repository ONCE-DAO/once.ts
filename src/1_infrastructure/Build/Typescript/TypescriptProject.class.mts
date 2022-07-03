import BuildConfig from "../../../3_services/Build/BuildConfig.interface.mjs";
import TypescriptProject from "../../../3_services/Build/Typescript/TypescriptProject.interface.mjs";
import DefaultTranspiler from "./Transpiler.class.mjs";

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
    }

    async build(config: BuildConfig): Promise<void> {
        console.group(`DefaultTypescriptProject build ${this.fullQualifiedNamespace} [${import.meta.url}]"`);

        const transformer = await DefaultTranspiler.init(this.path, config, this.fullQualifiedNamespace)
        const files = await transformer.transpile()
        await transformer.writeTsConfigPaths(files, this.name, this.namespace, this.version)
        await transformer.writeComponentDescriptor(this.name, this.namespace, this.version, files)

        console.groupEnd();
        console.log("DefaultTypescriptProject build done");
    }

    async watch(config: BuildConfig, distributionFolder: string): Promise<void> {
        console.group(`DefaultTypescriptProject watch ${this.fullQualifiedNamespace} [${import.meta.url}]"`);

        const transpiler = await DefaultTranspiler.init(this.path, config, `${this.namespace}.${this.name}[${this.version}]`)
        await transpiler.watch(async (files: string[]) => {
            await transpiler.writeTsConfigPaths(files, this.name, this.namespace, this.version)
            await transpiler.writeComponentDescriptor(this.name, this.namespace, this.version, files)
        })

        console.groupEnd();
        console.log("DefaultTypescriptProject watch done");
    }
}