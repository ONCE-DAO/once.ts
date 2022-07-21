import BuildConfig from "./BuildConfig.interface.mjs"
import NpmPackageInterface from "./Npm/NpmPackage.interface.mjs"

export default interface Buildable {
    install(config: BuildConfig, distributionFolder: string): Promise<void>
    beforeBuild(config: BuildConfig, distributionFolder: string): Promise<void>
    build(config: BuildConfig, distributionFolder: string, npmPackage: NpmPackageInterface): Promise<void>
    watch(config: BuildConfig, distributionFolder: string, npmPackage: NpmPackageInterface): Promise<void>
}