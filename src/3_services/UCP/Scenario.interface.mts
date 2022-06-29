export default interface Scenario {
    domain: string;
    scenarioPath: string;
    webRoot: string;
    
    init(): Promise<Scenario>;
}
