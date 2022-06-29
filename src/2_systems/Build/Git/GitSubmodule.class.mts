import { chmodSync, writeFileSync } from "fs";
import { join } from "path";
import Buildable from "../../../3_services/Build/Buildable.interface.mjs";
import GitRepository from "../../../3_services/Build/Git/GitRepository.interface.mjs";
import GitSubmodule, { GIT_SUBMODULE_CONSTANTS } from "../../../3_services/Build/Git/GitSubmodule.interface.mjs";
import DefaultGitRepository from "./GitRepository.class.mjs";

export default class DefaultGitSubmodule extends DefaultGitRepository implements GitSubmodule, Buildable {
    static async init(path: string): Promise<GitSubmodule> {
        const gitRepo = await DefaultGitRepository.init(path)
        return new DefaultGitSubmodule(gitRepo)
    }

    protected constructor(gitRepository: GitRepository) {
        super(gitRepository.path, gitRepository.remoteUrl, gitRepository.branch)
    }

    async install(): Promise<void> {
        this.logBuildInfo("install")
        this.writePostCheckoutHook()
        console.log("done\n");        
    }
    async beforeBuild(): Promise<void> {
        this.logBuildInfo("beforeBuild")
        console.log("done\n");        
    }
    async build(): Promise<void> {
        this.logBuildInfo("build")
        console.log("done\n");        
    }
    async afterBuild(): Promise<void> {
        this.logBuildInfo("afterBuild")
        console.log("done\n");        
    }

    private logBuildInfo(method: keyof Buildable) {
        console.log(`GitSubModule [${import.meta.url}]\nrun ${method} for ${this.path}`);
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
