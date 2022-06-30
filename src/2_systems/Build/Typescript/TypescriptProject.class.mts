import { execSync } from "child_process";
import { install } from "ts-patch";
import Buildable from "../../../3_services/Build/Buildable.interface.mjs";
import BuildConfig from "../../../3_services/Build/BuildConfig.interface.mjs";
import TypescriptProject from "../../../3_services/Build/Typescript/TypescriptProject.interface.mjs";
import DefaultTransformer from "./Transformer.class.mjs";

export default class DefaultTypescriptProject implements TypescriptProject {
    private path: string;

    constructor(path: string) {
        this.path = path;
    }

    static async init(path: string): Promise<TypescriptProject> {
        return new DefaultTypescriptProject(path)
    }

    async install(config: BuildConfig): Promise<void> {
        this.logBuildInfo("install")
        execSync("npm i -D ts-patch", { cwd: this.path, stdio: "inherit" })
        execSync("npx ts-patch i", { cwd: this.path, stdio: "inherit" })
        console.log("done\n");
    }
    async beforeBuild(config: BuildConfig): Promise<void> {
        this.logBuildInfo("beforeBuild")
        //TODO update tsconfig file paths, plugins
        console.log("done\n");
    }
    async build(config: BuildConfig): Promise<void> {
        this.logBuildInfo("build")
        install({ basedir: this.path })
        const transformer = await DefaultTransformer.init(this.path, config)
        transformer.transpile()
        //TODO run TSBuild
        console.log("done\n");
    }
    async afterBuild(config: BuildConfig): Promise<void> {
        this.logBuildInfo("afterBuild")
        //TODO perhaps copy stuff
        console.log("done\n");
    }

    private logBuildInfo(method: keyof Buildable) {
        console.log(`DefaultTypescriptProject [${import.meta.url}]\nrun ${method} for ${this.path}`);
    }
}