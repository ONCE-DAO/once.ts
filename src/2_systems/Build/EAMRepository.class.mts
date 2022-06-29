import EAMRepository from "../../3_services/Build/EAMRepository.interface.mjs";
import GitRepository from "../../3_services/Build/Git/GitRepository.interface.mjs";
import DefaultGitRepository from "./Git/GitRepository.class.mjs";
import DefaultGitSubmodule from "./Git/GitSubmodule.class.mjs";

export default class DefaultEAMRepository implements EAMRepository {
    private scenarioDomain: string;
    private basePath: string;
    private gitRepository: GitRepository;

    private constructor(scenarioDomain: string, basePath: string, gitRepository: GitRepository) {
        this.scenarioDomain = scenarioDomain;
        this.basePath = basePath;
        this.gitRepository = gitRepository;
    }

    static async init(scenarioDomain: string, basePath: string): Promise<EAMRepository> {
        const gitRepository = await DefaultGitRepository.init(basePath);
        return new DefaultEAMRepository(scenarioDomain, basePath, gitRepository);
    }

    async buildEAMD(): Promise<void> {
        const submodules = this.gitRepository.getSubmodules(DefaultGitSubmodule.init)

        throw new Error("Method not implemented.");
    }
}