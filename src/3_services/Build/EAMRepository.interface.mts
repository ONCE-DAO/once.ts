import ComponentBuilder from "./BuildComponent.interface.mjs"

export default interface EAMRepository {
    install(): Promise<void>
    beforeBuild(): Promise<void>
    build(fastRun: boolean): Promise<void>
    watch(fastRun: boolean): Promise<void>
    getComponentBuilder(): Promise<ComponentBuilder[]>
}