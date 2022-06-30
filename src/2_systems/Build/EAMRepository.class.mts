import { join } from "path";
import { SimpleGit } from "simple-git";
import Buildable from "../../3_services/Build/Buildable.interface.mjs";
import ComponentBuilder from "../../3_services/Build/BuildComponent.interface.mjs";
import BuildConfig from "../../3_services/Build/BuildConfig.interface.mjs";
import EAMRepository from "../../3_services/Build/EAMRepository.interface.mjs";
import GitRepository from "../../3_services/Build/Git/GitRepository.interface.mjs";
import { DefaultScenario } from "../UCP/Scenario.class.mjs";
import DefaultComponentBuilder from "./ComponentBuilder.class.mjs";
import DefaultGitRepository from "./Git/GitRepository.class.mjs";
import DefaultGitSubmodule from "./Git/GitSubmodule.class.mjs";



export default class DefaultEAMRepository implements EAMRepository {
    private gitRepository: GitRepository;
    private buildConfig: BuildConfig;
    static async init(scenarioDomain: string, basePath: string): Promise<EAMRepository> {
        const buildConfig: BuildConfig = {
            scenario: await DefaultScenario.init(scenarioDomain, basePath),
            eamdPath: basePath,
            sourceComponentsPath: join(basePath, "Components"),
            transformer: [],
            distributionFolder: ""
        }

        const gitRepository = await DefaultGitRepository.init(basePath, buildConfig.sourceComponentsPath);

        //TODO@pb move to config
        const transformer = (await this.getComponentBuilder(gitRepository, buildConfig)).find(x => x.name === "Transformer" && x.namespace === "tla.EAM.Thinglish" && x.version === "build")
        if (transformer === undefined) throw "Without transformer once cannot be build"
        buildConfig.distributionFolder = transformer.distributionFolder;
        await transformer.install(buildConfig);
        await transformer.build(buildConfig);
        buildConfig.transformer?.push({ transform: join(transformer.distributionFolder, "index.cjs"), type:"program" })

        return new DefaultEAMRepository(buildConfig, gitRepository);
    }

    private constructor(buildConfig: BuildConfig, gitRepository: GitRepository) {
        this.buildConfig = buildConfig;
        this.gitRepository = gitRepository;
    }

    private static async getComponentBuilder(gitRepository: GitRepository, buildConfig: BuildConfig): Promise<ComponentBuilder[]> {
        return await Promise.all((await gitRepository
            .getSubmodules(DefaultGitSubmodule.init))
            .filter(x => !x.path.includes("3rdParty"))
            .map(async (submodule) => {
                return await DefaultComponentBuilder.init(submodule, buildConfig)
            }))
    }

    install = async () => await this.runBuildStep("install")
    beforeBuild = async () => await this.runBuildStep("beforeBuild")
    build = async () => await this.runBuildStep("build")
    afterBuild = async () => await this.runBuildStep("afterBuild")

    private async runBuildStep(prop: keyof Buildable) {
        (await this.getComponentBuilder()).forEach(async (component) => {
            await component[prop]({ ...this.buildConfig, distributionFolder: component.distributionFolder })
        })
    }

    private async getComponentBuilder(): Promise<ComponentBuilder[]> {
        return await DefaultEAMRepository.getComponentBuilder(this.gitRepository, this.buildConfig)
    }
}