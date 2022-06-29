import Buildable from "../../../3_services/Build/Buildable.interface.mjs";
import TypescriptProject from "../../../3_services/Build/Typescript/TypescriptProject.interface.mjs";

export default class DefaultTypescriptProject implements TypescriptProject {
    private path: string;

    constructor(path: string) {
        this.path = path;
    }

    static async init(path: string): Promise<TypescriptProject> {
        return new DefaultTypescriptProject(path)
    }

    async install(): Promise<void> {
        this.logBuildInfo("install")
        //TODO create transformer
        //TODO update tsconfig file paths, plugins
        //TODO install ts-patch
        console.log("done\n");
    }
    async beforeBuild(): Promise<void> {
        this.logBuildInfo("beforeBuild")
        //TODO update tsconfig file paths, plugins
        console.log("done\n");
    }
    async build(): Promise<void> {
        this.logBuildInfo("build")
        //TODO run TSBuild
        console.log("done\n");
    }
    async afterBuild(): Promise<void> {
        this.logBuildInfo("afterBuild")
        //TODO perhaps copy stuff
        console.log("done\n");
    }

    private logBuildInfo(method: keyof Buildable) {
        console.log(`DefaultTypescriptProject [${import.meta.url}]\nrun ${method} for ${this.path}`);
    }
}