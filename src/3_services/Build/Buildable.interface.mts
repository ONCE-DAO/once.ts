export default interface Buildable {
    install(): Promise<void>
    beforeBuild(): Promise<void>
    build(): Promise<void>
    afterBuild(): Promise<void>
}