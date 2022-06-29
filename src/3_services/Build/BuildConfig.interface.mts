import Scenario from "../UCP/Scenario.interface.mjs";

export default interface BuildConfig {
    /**
     * The scenario the build will run for
     * e.g. 
     * ```ts 
     * "localhost"
     * ```
     */
    scenario: Scenario;

    eamdPath: string;
    /**
     * absolute path to the "Components" folder, where the submodules are located 
     */
    sourceComponentsPath: string;
}


