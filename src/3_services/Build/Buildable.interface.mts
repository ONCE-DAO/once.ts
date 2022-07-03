import BuildConfig from "./BuildConfig.interface.mjs"

export default interface Buildable {
    install(config: BuildConfig, distributionFolder: string): Promise<void>
    beforeBuild(config: BuildConfig, distributionFolder: string): Promise<void>
    build(config: BuildConfig, distributionFolder: string): Promise<void>
    watch(config: BuildConfig, distributionFolder: string): Promise<void>
}