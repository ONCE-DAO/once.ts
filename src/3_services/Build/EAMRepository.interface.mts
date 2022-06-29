import Buildable from "./Buildable.interface.mjs";

export default interface EAMRepository {
    install(): Promise<void>
    beforeBuild(): Promise<void>
    build(): Promise<void>
    afterBuild(): Promise<void>
}