import GitRepository from "../GitRepository.interface.mjs"
import ComponentBuilder from "./BuildComponent.interface.mjs"
import BuildConfig from "./BuildConfig.interface.mjs"

export default interface EAMRepository {
    install(): Promise<void>
    beforeBuild(): Promise<void>
    build(): Promise<void>
    watch(): Promise<void>
    getComponentBuilder(): Promise<ComponentBuilder[]>
}