import ComponentInterface from "../../3_services/UCP/Component.interface.mjs";
import EAMDInterface, { EAMD_CONSTANTS } from "../../3_services/UCP/EAMD.interface.mjs";
import ScenarioInterface from "../../3_services/UCP/Scenario.interface.mjs";
import DefaultComponent from "./DefaultComponent.class.mjs";
import { DefaultScenario } from "./DefaultScenario.mjs";



export default class DefaultEAMD implements EAMDInterface {
    components: ComponentInterface[];
    scenario: ScenarioInterface;

    /**
     * Initialise a **E**nterprise **A**rchitecture **M**anagement **D**irectory, by scenario domain and basePath
     * @example
     * ```ts
     * await init("localhost",process.cwd());Í
     * ```
     * @param {string} [scenariodomain=DefaultValue] the full qualified domain of scenario
     * e.g.
     * - ```ts 
     * "localhost"
     * ```
     * - ```ts 
     * "de.wo-da"
     * ```
     * @param basePath The base directory of a EAMD repository which includes packages/components as git submodules
     * e.g.
     * - ```ts 
     * "/EAMD.ucp"
     * ```
     * - ```ts 
     * "/var/dev/EAMD.ucp"
     * ```
     * - ```ts 
     * process.cwd()
     * ```
     * @returns the initialised **E**nterprise **A**rchitecture **M**anagement **D**irectory
     */
    static async init(scenariodomain: string = EAMD_CONSTANTS.DEFAULT_SCENARIO_DOMAIN, basePath: string = process.cwd()): Promise<EAMDInterface> {
        const components: ComponentInterface[] = [
            new DefaultComponent(),
            new DefaultComponent(),
            new DefaultComponent(),
            new DefaultComponent()
        ];

        const instance = new DefaultEAMD(components, await DefaultScenario.init(scenariodomain, basePath))
        return await instance.init();
    }

    private constructor(components: ComponentInterface[], scenario: ScenarioInterface) {
        this.components = components;
        this.scenario = scenario;
    }

    async init(): Promise<EAMDInterface> {
        return this;
    }

    async build(): Promise<void> {
        console.log("Method not implemented.");
    }

    async prepareBuild(): Promise<void> {
        for (const component of this.components) {
            // await component.prepareBuild()
        }
    }
}

