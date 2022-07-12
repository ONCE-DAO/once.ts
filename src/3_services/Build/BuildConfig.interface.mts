import Scenario from "../UCP/Scenario.interface.mjs";
import { PluginConfig } from "ts-patch"

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

    transformer?: PluginConfig[];

    distributionFolder: string;

    // srcPath:string
}
