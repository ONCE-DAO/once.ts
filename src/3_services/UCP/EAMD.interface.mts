import Scenario from "./Scenario.interface.mjs";

export default interface EAMD {
    currentScenario: Scenario
    get scenarios(): Promise<Scenario[]>
    discover(): Promise<{ [i: string]: string }>;
}

export enum EAMD_CONSTANTS {
    DEFAULT_SCENARIO_DOMAIN = "localhost",
    SCENARIOS = "Scenarios",
}
