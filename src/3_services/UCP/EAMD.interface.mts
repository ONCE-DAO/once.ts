import Scenario from "./Scenario.interface.mjs";

export default interface EAMD {
    scenarios: Promise<Scenario[]>

    init(): Promise<EAMD>
}

export enum EAMD_CONSTANTS {
    DEFAULT_SCENARIO_DOMAIN = "localhost",
    SCENARIOS = "Scenarios",
}

