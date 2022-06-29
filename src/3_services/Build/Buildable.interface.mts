import BuildConfig from "./BuildConfig.interface.mjs"

export default interface Buildable {
    install(config:BuildConfig): Promise<void>
    beforeBuild(config:BuildConfig): Promise<void>
    build(config:BuildConfig): Promise<void>
    afterBuild(config:BuildConfig): Promise<void>
}