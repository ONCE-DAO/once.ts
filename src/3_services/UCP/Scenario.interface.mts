export default interface Scenario {
    domain: string;
    basePath: string;
    scenarioPath: string;
    webRoot: string;

    init(): Promise<Scenario>;
}
