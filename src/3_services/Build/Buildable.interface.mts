import BuildConfig from "./BuildConfig.interface.mjs"

export default interface Buildable {
    install(config: BuildConfig, distributionFolder: string): Promise<void>
    beforeBuild(config: BuildConfig, distributionFolder: string): Promise<void>
    build(config: BuildConfig, distributionFolder: string): Promise<void>
    afterBuild(config: BuildConfig, distributionFolder: string): Promise<void>
}