import { chmodSync, writeFileSync } from "fs";
import { dirname, relative, sep } from "path";
import { basename, join } from "path";
import { SimpleGit } from "simple-git";
import BuildConfig from "../../../3_services/Build/BuildConfig.interface.mjs";
import GitRepository from "../../../3_services/Build/Git/GitRepository.interface.mjs";
import GitSubmodule, { GIT_SUBMODULE_CONSTANTS } from "../../../3_services/Build/Git/GitSubmodule.interface.mjs";
import DefaultGitRepository from "./GitRepository.class.mjs";

export default class DefaultGitSubmodule extends DefaultGitRepository implements GitSubmodule {
    get name(): string {
        return basename(dirname(this.path))
    }

    get namespace(): string {
        const directory = join(this.path, "..", "..")
        const namespaceFolder = relative(this.srcComponentsDirectory, directory)
        return namespaceFolder.split(sep).join(".")
    }

    static async init(path: string, srcComponentsDirectory: string): Promise<GitSubmodule> {
        const gitRepo = await DefaultGitRepository.init(path, srcComponentsDirectory) as DefaultGitRepository
        return new DefaultGitSubmodule(gitRepo, srcComponentsDirectory, gitRepo.gitRepository)
    }

    protected constructor(gitRepository: GitRepository, srcComponentsDirectory: string, simpleGitRepository: SimpleGit) {
        super(gitRepository.path, gitRepository.remoteUrl, gitRepository.branch, srcComponentsDirectory, simpleGitRepository)
    }
    /**
     * Foo
     * @override 
     * @returns {Promise<void>}
     * @param config 
     * @param distributionFolder 
     */
    async install(config: BuildConfig, distributionFolder: string): Promise<void> {
        console.group(`GitSubmodule install [${import.meta.url}]"`);
        this.writePostCheckoutHook()
        await super.install(config, distributionFolder)
        console.groupEnd();
        console.log("GitSubmodule install done");
    }

    private writePostCheckoutHook(): void {
        writeFileSync(this.PostCheckFilePath, `
        #!/bin/bash                                                                      
        set -e                                                                           
        printf 'post-checkout hook'                                                

        newHEAD=$(git name-rev --name-only $2)                                                                     
        checkoutType="$3"                                                                  

        [[ $checkoutType == 1 ]] && checkoutType='branch' || checkoutType='file' ;                                

        echo 'Checkout type: '$checkoutType                                              
        echo '    prev HEAD: ' $prevHEAD                    
        echo '     new HEAD: ' $newHEAD

        if [ $checkoutType == "branch" ]
        then
            echo "branch"
            if [ $newHEAD != "${this.branch}" ]
            then
                git checkout ${this.branch}
                echo 'Inside submodule you are not allowed to change branch.'
                echo 'In order to change branch, please use the once.cli.'
                echo 'command tbd'
                exit 1
            fi
        fi`)
        chmodSync(this.PostCheckFilePath, "755")
        console.log(`Wrote post-checkout-hook to ${this.PostCheckFilePath}`);

    }

    private get PostCheckFilePath() {
        return join(this.gitDir, GIT_SUBMODULE_CONSTANTS.POST_CHECKOUT_PATH)
    }
}
