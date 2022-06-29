import Component from "./Component.interface.mjs";
import Scenario from "./Scenario.interface.mjs";

export default interface EAMD {
    components: Component[];
    scenario: Scenario;

    init(): Promise<EAMD>
    /**
     * Method which will prepare the Enterprise Architecture Management Directory for the build.
     * e.g.
     * - install Dependencies
     * - run scripts
     * @param scenario 
     */
    prepareBuild(): Promise<void>

    /**
     * Method will run all necessary steps to create a distribution folder
     * @param scenario 
     */
    build(): Promise<void>;
}

export enum EAMD_CONSTANTS {
    DEFAULT_SCENARIO_DOMAIN = "localhost",
    SCENARIOS = "Scenarios",
    WEB_ROOT = "webroot"
}

