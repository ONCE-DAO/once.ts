export default interface Scenario {
    domain: string;
    scenarioPath: string;
    
    init(): Promise<Scenario>;
}
