import { mkdirSync } from "fs";
import { join } from "path";
import { EAMD_CONSTANTS } from "../../3_services/UCP/EAMD.interface.mjs";
import ScenarioInterface from "../../3_services/UCP/Scenario.interface.mjs";


export class DefaultScenario implements ScenarioInterface {
    domain: string = EAMD_CONSTANTS.DEFAULT_SCENARIO_DOMAIN;
    private basePath: string = process.cwd();

    private constructor() {

    }

    static async init(domain: string = EAMD_CONSTANTS.DEFAULT_SCENARIO_DOMAIN, basePath: string = process.cwd()): Promise<ScenarioInterface> {
        const instance = new DefaultScenario()
        instance.domain = domain
        instance.basePath = basePath
        return await instance.init()
    }

    get scenarioPath(): string {
        return join(this.basePath, EAMD_CONSTANTS.SCENARIOS, join(...this.domain.split(".")));
    }

    get webRoot(): string {
        return join(this.scenarioPath, EAMD_CONSTANTS.WEB_ROOT)
    }

    async init(): Promise<ScenarioInterface> {
        mkdirSync(this.scenarioPath, { recursive: true })
        return this
    }
}
