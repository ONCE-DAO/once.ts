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
    private _componentBuilder: Promise<ComponentBuilder[]> | undefined;

    static async init(scenarioDomain: string, basePath: string, fastRun: boolean = false): Promise<EAMRepository> {
        const sourceComponentsPath = join(basePath, "Components");
        const gitRepository = await DefaultGitRepository.init(basePath, sourceComponentsPath);

        const buildConfig: BuildConfig = {
            scenario: await DefaultScenario.init(scenarioDomain, basePath),
            eamdPath: basePath,
            sourceComponentsPath,
            transformer: [],
            distributionFolder: "",
            ignoreErrors: false,
            fastRun
        }

        const eamr = new DefaultEAMRepository(buildConfig, gitRepository);

        if (fastRun === false) {
            // TODO remove transformer build
            const transformer = await eamr.getTransformerBuilder();
            const config = { ...buildConfig, distributionFolder: transformer.distributionFolder }
            await transformer.install(config)
            await transformer.beforeBuild(config)
            await transformer.build(config)
        }
        return eamr;
    }

    private constructor(buildConfig: BuildConfig, gitRepository: GitRepository) {
        this.buildConfig = buildConfig;
        this.gitRepository = gitRepository;
    }


    private static async getAllComponentBuilder(gitRepository: GitRepository, buildConfig: BuildConfig): Promise<ComponentBuilder[]> {
        return (await Promise.all((await gitRepository
            .getSubmodules(DefaultGitSubmodule.init))
            .map(async (submodule) => {
                return await DefaultComponentBuilder.init(submodule, buildConfig)
            })))
    }


    private static async getTransformerBuilder(gitRepository: GitRepository, buildConfig: BuildConfig): Promise<ComponentBuilder[]> {
        const componentBuilders = await this.getAllComponentBuilder(gitRepository, buildConfig);
        return [
            ...componentBuilders.filter(x => `${x.namespace}.${x.name}` === "tla.EAM.Thinglish.Transformer"),
        ]
    }

    private static async getComponentBuilder(gitRepository: GitRepository, buildConfig: BuildConfig): Promise<ComponentBuilder[]> {
        const componentBuilders = await this.getAllComponentBuilder(gitRepository, buildConfig);
        return [
            ...componentBuilders.filter(x => `${x.namespace}.${x.name}` !== "tla.EAM.Thinglish.Transformer")
        ]
    }

    install = () => this.run("install");
    beforeBuild = () => this.run("beforeBuild");

    async build(fastRun: boolean = false): Promise<void> {
        this.buildConfig.fastRun = fastRun;
        if (fastRun === false) {
            this.buildConfig.ignoreErrors = true;
            await this.run('build');
        }
        this.buildConfig.ignoreErrors = false;
        await this.run('build');
    }

    async watch(fastRun: boolean = false) {
        this.buildConfig.fastRun = fastRun;
        if (fastRun === false) {
            this.buildConfig.ignoreErrors = true;
            await this.run('build');
        }
        this.buildConfig.ignoreErrors = false;
        this.run("watch");
    }


    private async run(prop: keyof Buildable): Promise<void> {
        // let resultPromise: Promise<any>[] = [];

        for (let componentBuilder of await this.getComponentBuilder()) {
            await componentBuilder[prop]({ ...this.buildConfig, distributionFolder: componentBuilder.distributionFolder });
        }
        // await Promise.all(resultPromise);

    }

    getComponentBuilder(): Promise<ComponentBuilder[]> {
        if (!this._componentBuilder) {
            this._componentBuilder = DefaultEAMRepository.getComponentBuilder(this.gitRepository, this.buildConfig);
        }
        return this._componentBuilder;
    }

    async getTransformerBuilder(): Promise<ComponentBuilder> {
        const transformers = await DefaultEAMRepository.getTransformerBuilder(this.gitRepository, this.buildConfig)
        if (transformers.length > 1) {
            throw new Error("More than one transformer found")
        }
        if (transformers.length === 0) {
            throw new Error("No transformer found")
        }
        return transformers[0]
    }
}