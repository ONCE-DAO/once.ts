import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { DEFAULT_SCENARIO, SCENARIOS_FOLDER } from "../../1_infrastructure/Constants.mjs";
import Scenario from "../../3_services/Scenario.interface.mjs";

export default class DefaultScenario implements Scenario {
    eamdPath: string;
    name: string;

    static get Default(): DefaultScenario {
        return new DefaultScenario(process.cwd())
    }

    constructor(eamdPath: string, name = DEFAULT_SCENARIO) {
        this.eamdPath = eamdPath
        this.name = name
        !existsSync(this.scenarioPath) && mkdirSync(this.scenarioPath, { recursive: true })
    }

    get scenarioPath(): string {
        return join(SCENARIOS_FOLDER, this.name)
    }

    get webRoot(): string {
        return join(this.scenarioPath/*, EAMD_FOLDERS.WEB_ROOT*/)
    }
}