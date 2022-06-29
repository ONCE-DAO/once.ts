import { writeFileSync } from "fs";
import Buildable from "../../3_services/Build/Buildable.interface.mjs";
import ComponentBuilder from "../../3_services/Build/BuildComponent.interface.mjs";
import EAMRepository from "../../3_services/Build/EAMRepository.interface.mjs";
import GitRepository from "../../3_services/Build/Git/GitRepository.interface.mjs";
import DefaultComponentBuilder from "./ComponentBuilder.class.mjs";
import DefaultGitRepository from "./Git/GitRepository.class.mjs";
import DefaultGitSubmodule from "./Git/GitSubmodule.class.mjs";

export default class DefaultEAMRepository implements EAMRepository {
    private scenarioDomain: string;
    private basePath: string;
    private gitRepository: GitRepository;

    static async init(scenarioDomain: string, basePath: string): Promise<EAMRepository> {
        const gitRepository = await DefaultGitRepository.init(basePath);
        return new DefaultEAMRepository(scenarioDomain, basePath, gitRepository);
    }

    private constructor(scenarioDomain: string, basePath: string, gitRepository: GitRepository) {
        this.scenarioDomain = scenarioDomain;
        this.basePath = basePath;
        this.gitRepository = gitRepository;
    }

    install = async () => await this.runBuildStep("install")
    beforeBuild = async () => await this.runBuildStep("beforeBuild")
    build = async () => await this.runBuildStep("build")
    afterBuild = async () => await this.runBuildStep("afterBuild")

    private async runBuildStep(prop: keyof Buildable) {
        (await this.getComponentBuilder()).forEach(async (component) => {
            await component[prop]()
        })
    }

    private async getComponentBuilder(): Promise<ComponentBuilder[]> {
        return await Promise.all((await this.gitRepository
            .getSubmodules(DefaultGitSubmodule.init))
            .filter(x => !x.path.includes("3rdParty"))
            .map(async (submodule) => {
                return await DefaultComponentBuilder.init(submodule)
            }))
    }
}