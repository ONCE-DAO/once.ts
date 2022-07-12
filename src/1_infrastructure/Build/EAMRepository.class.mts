import { join } from "path";
import { DefaultScenario } from "../../2_systems/UCP/Scenario.class.mjs";
import Buildable from "../../3_services/Build/Buildable.interface.mjs";
import ComponentBuilder from "../../3_services/Build/BuildComponent.interface.mjs";
import BuildConfig from "../../3_services/Build/BuildConfig.interface.mjs";
import EAMRepository from "../../3_services/Build/EAMRepository.interface.mjs";
import GitRepository from "../../3_services/Build/Git/GitRepository.interface.mjs";
import DefaultComponentBuilder from "./ComponentBuilder.class.mjs";
import DefaultGitRepository from "./Git/GitRepository.class.mjs";
import DefaultGitSubmodule from "./Git/GitSubmodule.class.mjs";



export default class DefaultEAMRepository implements EAMRepository {
    private gitRepository: GitRepository;
    private buildConfig: BuildConfig;
    static async init(scenarioDomain: string, basePath: string): Promise<EAMRepository> {
        const sourceComponentsPath = join(basePath, "Components");
        const gitRepository = await DefaultGitRepository.init(basePath, sourceComponentsPath);

        const buildConfig: BuildConfig = {
            scenario: await DefaultScenario.init(scenarioDomain, basePath),
            eamdPath: basePath,
            sourceComponentsPath,
            transformer: [],
            distributionFolder: "",
        }

        return new DefaultEAMRepository(buildConfig, gitRepository);
    }

    private constructor(buildConfig: BuildConfig, gitRepository: GitRepository) {
        this.buildConfig = buildConfig;
        this.gitRepository = gitRepository;
    }

    private static async getComponentBuilder(gitRepository: GitRepository, buildConfig: BuildConfig): Promise<ComponentBuilder[]> {
        const componentBuilders = (await Promise.all((await gitRepository
            .getSubmodules(DefaultGitSubmodule.init))
            .map(async (submodule) => {
                // buildConfig.srcPath = submodule.path;
                return await DefaultComponentBuilder.init(submodule, buildConfig)
            })))
        return [
            ...componentBuilders.filter(x => `${x.namespace}.${x.name}` === "tla.EAM.Thinglish.Transformer"),
            ...componentBuilders.filter(x => `${x.namespace}.${x.name}` !== "tla.EAM.Thinglish.Transformer")
        ]
    }

    install = () => this.run("install");
    beforeBuild = () => this.run("beforeBuild");
    build = () => this.run("build");
    watch = () => this.run("watch");

    private async run(prop: keyof Buildable): Promise<void> {
        for (let componentBuilder of await this.getComponentBuilder()) {
            await componentBuilder[prop]({ ...this.buildConfig, distributionFolder: componentBuilder.distributionFolder })
        }
    }

    async getComponentBuilder(): Promise<ComponentBuilder[]> {
        return await DefaultEAMRepository.getComponentBuilder(this.gitRepository, this.buildConfig)
    }
}