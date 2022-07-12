import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import simpleGit, { SimpleGit } from "simple-git";
import Buildable from "../../../3_services/Build/Buildable.interface.mjs";
import BuildConfig from "../../../3_services/Build/BuildConfig.interface.mjs";
import GitRepository, { NotAGitRepositoryError } from "../../../3_services/Build/Git/GitRepository.interface.mjs";
import SubmoduleInterface from "../../../3_services/Build/Git/GitSubmodule.interface.mjs";

export default class DefaultGitRepository implements GitRepository {
    path: string;
    remoteUrl: string;
    branch: string;
    readonly gitRepository: SimpleGit
    protected readonly srcComponentsDirectory: string

    static async init(path: string, srcComponentsDirectory: string): Promise<GitRepository> {
        if (!existsSync(join(path, ".git"))) throw new NotAGitRepositoryError();
        const gitRepository = simpleGit(path, { binary: "git", baseDir: path });

        return new DefaultGitRepository(
            path,
            await this.getRemoteUrl(gitRepository),
            await this.getBranch(gitRepository),
            srcComponentsDirectory,
            gitRepository
        );
    }

    private static async getRemoteUrl(gitRepository: SimpleGit): Promise<string> {
        const list = await gitRepository.listConfig()
        const configKey = "remote.origin.url";
        if (Object.keys(list.all).some(x => x === configKey))
            return await (await gitRepository.getConfig("remote.origin.url")).value || "";
        return "";
    }

    private static async getBranch(gitRepository: SimpleGit): Promise<string> {
        const status = await gitRepository.status();
        return status.current || "";
    }

    protected constructor(path: string, remoteUrl: string, branch: string, srcComponentsDirectory: string, gitRepository: SimpleGit) {
        this.path = path;
        this.remoteUrl = remoteUrl;
        this.branch = branch;
        this.srcComponentsDirectory = srcComponentsDirectory
        this.gitRepository = gitRepository;
    }

    async setOrigin(origin: string): Promise<void> {
        await this.gitRepository.remote(["set-url", "origin", origin])
    }

    async install(_config: BuildConfig, _distributionFolder: string): Promise<void> {
        console.group(`GitRepository install [${import.meta.url}]"`);
        await this.updateSubmodules();
        console.groupEnd();
        console.log("GitRepository install done");
    }

    async beforeBuild(_config: BuildConfig, _distributionFolder: string): Promise<void> {
    }

    async build(_config: BuildConfig, _distributionFolder: string): Promise<void> {
    }

    async watch(_config: BuildConfig, _distributionFolder: string): Promise<void> {
    }

    async getSubmodules(submoduleInit: (path: string, srcComponentsDirectory: string) => Promise<SubmoduleInterface>): Promise<SubmoduleInterface[]> {
        const submodules: (SubmoduleInterface)[] = [];
        const modules = execSync("git submodule foreach --quiet 'echo $name'", {
            encoding: "utf8",
            cwd: this.path
        })
            .split("\n")
            .filter((e) => e);

        for (let module of modules) {
            const branch = await this.getSubmoduleValue(`submodule.${module}.branch`);
            const relativeSubmodulePath = await this.getSubmoduleValue(`submodule.${module}.path`);
            const remoteUrl = await this.getSubmoduleValue(`submodule.${module}.url`);

            const submodule = await submoduleInit(join(this.path, relativeSubmodulePath), this.srcComponentsDirectory);
            if (remoteUrl !== submodule.remoteUrl) {
                try {
                    await submodule.setOrigin(remoteUrl)
                    console.warn(`mismatch between .gitmodules remote-url and gitRepository remote-url
                .gitmodules\t${submodule.remoteUrl}
                repository\t${remoteUrl}
                
                repository has been updated to .gitmodules url. If you want to stay with repository url
                call
                git submodule set-url ${relativeSubmodulePath} ${remoteUrl}

                and run build again
                `)
                }
                catch (e) {
                    console.log(e);
                }
            }

            await submodule.checkout(branch);
            submodules.push(submodule);

        }
        return submodules;
    }

    async checkout(branch: string): Promise<void> {
        if (branch !== this.branch && branch !== "") {
            await this.gitRepository.checkout([branch])
        }
    }

    async updateSubmodules(): Promise<void> {
        await this.gitRepository.subModule(["update", "--init", "--remote", "--recursive"])
        console.log(`Submodules updated for ${this.path}`);
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

    protected get gitDir(): string {
        const gitDir = execSync("git rev-parse --git-dir", { cwd: this.path }).toString()
        return gitDir.replace("\n", "")
    }
}