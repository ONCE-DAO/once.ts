import Buildable from "./Buildable.interface.mjs"
import ComponentBuilder from "./BuildComponent.interface.mjs"

export default interface EAMRepository {
    install(): Promise<void>
    beforeBuild(): Promise<void>
    build(fastRun: boolean, buildPath?: string): Promise<void>
    watch(fastRun: boolean): Promise<void>
    getComponentBuilder(): Promise<ComponentBuilder[]>
    ignoreErrors: boolean;
    singleRun(prop: keyof Buildable, path: string): Promise<void>
}