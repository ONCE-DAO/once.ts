import GitRepository from "../../../3_services/Build/Git/GitRepository.interface.mjs";
import GitSubmodule from "../../../3_services/Build/Git/GitSubmodule.interface.mjs";
import DefaultGitRepository from "./GitRepository.class.mjs";

export default class DefaultGitSubmodule extends DefaultGitRepository implements GitSubmodule {
    protected constructor(gitRepository: GitRepository) {
        super(gitRepository.path, gitRepository.remoteUrl, gitRepository.branch)
    }

    static async init(path: string): Promise<GitSubmodule> {
        const gitRepo = await DefaultGitRepository.init(path)
        return new DefaultGitSubmodule(gitRepo)
    }
}
