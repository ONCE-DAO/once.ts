import { execSync } from "child_process"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"
import DefaultGitRepository from "../../../../src/1_infrastructure/Build/Git/GitRepository.class.mjs"
import DefaultGitSubmodule from "../../../../src/1_infrastructure/Build/Git/GitSubmodule.class.mjs"
import { GIT_REPOSITORY_CONSTANTS, NotAGitRepositoryError } from "../../../../src/3_services/Build/Git/GitRepository.interface.mjs"

describe("When directory is not a git repo", () => {
    test("init function will throw a error", () => {
        const emptyDirectory = mkdtempSync(join(tmpdir(), "empty-"))
        try {
            const fn = async () => {
                await DefaultGitRepository.init(emptyDirectory, emptyDirectory)
            }
            expect(fn).rejects.toThrow(NotAGitRepositoryError)
            expect(fn).rejects.toThrowError(GIT_REPOSITORY_CONSTANTS.NOT_A_REPO)
        }
        finally {
            rmSync(emptyDirectory, { recursive: true })
        }
    })
})

describe("When directory is a git repo", () => {
    test("init function will return repo with right branch and no remote", async () => {
        const gitDirectory = mkdtempSync(join(tmpdir(), "git-"))

        try {
            execSync("git init", { cwd: gitDirectory })
            execSync("git checkout -b myBranch", { cwd: gitDirectory })
            const gitRepository = await DefaultGitRepository.init(gitDirectory, gitDirectory)
            expect(gitRepository.branch).toBe("myBranch")
            expect(gitRepository.remoteUrl).toBe("")

        }
        finally {
            rmSync(gitDirectory, { recursive: true })
        }
    })
})

describe("When directory is a cloned git repo", () => {
    test("init function will return repo with right branch and remote-url", async () => {
        const gitDirectory = mkdtempSync(join(tmpdir(), "git-"))

        try {
            const remoteUrl = "https://github.com/ONCE-DAO/EAMD.ucp.git";
            execSync(`git clone ${remoteUrl} .`, { cwd: gitDirectory })

            const gitRepository = await DefaultGitRepository.init(gitDirectory, gitDirectory);
            expect(gitRepository).not.toBeUndefined();
            expect(gitRepository).not.toBeNull();
            expect(gitRepository.branch).toBe("main")
            expect(gitRepository.remoteUrl).toBe(remoteUrl)
        }
        finally {
            rmSync(gitDirectory, { recursive: true })
        }
    })
})


describe("When directory is a git repo and contains submodule", () => {
    test("init function will return repo with right branch and no remote and submoduleCount", async () => {
        const gitDirectory = mkdtempSync(join(tmpdir(), "git-"))
        const submoduleDirectory = join(gitDirectory, "submodule")

        try {
            mkdirSync(submoduleDirectory, { recursive: true })

            execSync("git init", { cwd: submoduleDirectory })
            writeFileSync(join(submoduleDirectory, "sample.txt"), "Test")
            execSync("git add -A", { cwd: submoduleDirectory })
            execSync("git commit -m 'initial'", { cwd: submoduleDirectory })

            execSync("git init", { cwd: gitDirectory })
            execSync("git checkout -b myBranch", { cwd: gitDirectory })

            execSync("git submodule add ./submodule", { cwd: gitDirectory })
            execSync("git add -A", { cwd: gitDirectory })
            execSync("git commit -m 'initial'", { cwd: gitDirectory })

            const gitRepository = await DefaultGitRepository.init(gitDirectory, gitDirectory)
            expect(gitRepository.branch).toBe("myBranch")
            expect(gitRepository.remoteUrl).toBe("")
            expect((await gitRepository.getSubmodules(DefaultGitSubmodule.init)).length).toBe(1)
        }
        finally {
            rmSync(gitDirectory, { recursive: true })
        }
    })
})
