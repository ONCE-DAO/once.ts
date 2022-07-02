export default interface Scenario {
    namespace: string;
    scenarioPath: string;

    init(): Promise<Scenario>;
    get components(): Promise<string[]>

}
