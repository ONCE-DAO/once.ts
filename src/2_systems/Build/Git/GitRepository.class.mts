import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import simpleGit, { SimpleGit } from "simple-git";
import GitRepository, { NotAGitRepositoryError } from "../../../3_services/Build/Git/GitRepository.interface.mjs";
import SubmoduleInterface from "../../../3_services/Build/Git/GitSubmodule.interface.mjs";

export default class DefaultGitRepository implements GitRepository {
    path: string;
    remoteUrl: string;
    branch: string;
    protected readonly gitRepository: SimpleGit

    static async init(path: string): Promise<GitRepository> {
        if (!existsSync(join(path, ".git"))) throw new NotAGitRepositoryError();
        const gitRepository = simpleGit(path, { binary: "git" });


        return new DefaultGitRepository(
            path,
            await this.getRemoteUrl(gitRepository),
            await this.getBranch(gitRepository)
        );
    }

    private static async getRemoteUrl(gitRepository: SimpleGit): Promise<string> {
        const config = await gitRepository.getConfig("remote.origin.url");
        return config.value || "";
    }

    private static async getBranch(gitRepository: SimpleGit): Promise<string> {
        const status = await gitRepository.status();
        return status.current || "";
    }

    protected constructor(path: string, remoteUrl: string, branch: string) {
        this.path = path;
        this.remoteUrl = remoteUrl;
        this.branch = branch;
        this.gitRepository = simpleGit(this.path, { binary: "git" });
    }


    async getSubmodules(submoduleInit: (path: string) => Promise<SubmoduleInterface>): Promise<SubmoduleInterface[]> {
        const submodules: (SubmoduleInterface)[] = [];
        const modules = execSync("git submodule foreach --quiet 'echo $name'", {
            encoding: "utf8",
            cwd: this.path
        })
            .split("\n")
            .filter((e) => e);

        for (let module of modules) {
            const branch = await this.getSubmoduleValue(`submodule.${module}.branch`);
            const name = module.replace(`@${branch}`, "");
            const path = await this.getSubmoduleValue(`submodule.${module}.path`);

            const submodule = await submoduleInit(path);
            // await submoduleInit(
            //     module.replace(`@${branch}`, ""),
            //     await this.getSubmoduleValue(`submodule.${module}.path`),
            //     await this.getSubmoduleValue(`submodule.${module}.url`),
            //     branch,
            //     { baseDir: this.path }
            // )
            submodules.push(submodule);
        }
        return submodules;
    }
    checkout(branch: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    updateSubmodules(): void {
        throw new Error("Method not implemented.");
    }


    private async getSubmoduleValue(key: string): Promise<string> {
        const rawResult = await this.gitRepository.raw(
            "config",
            "--file",
            ".gitmodules",
            "--get",
            key
        );
        return rawResult.replace(/\n$/, "");
    }

}