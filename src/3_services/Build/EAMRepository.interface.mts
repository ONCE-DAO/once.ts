export default interface EAMRepository {
    install(): Promise<void>
    beforeBuild(): Promise<void>
    build(): Promise<void>
    watch(): Promise<void>
}