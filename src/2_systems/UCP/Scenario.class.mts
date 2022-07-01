import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join, relative, sep } from "path";
import { EAMD_CONSTANTS } from "../../3_services/UCP/EAMD.interface.mjs";
import ScenarioInterface from "../../3_services/UCP/Scenario.interface.mjs";

export class DefaultScenario implements ScenarioInterface {
    namespace: string = EAMD_CONSTANTS.DEFAULT_SCENARIO_DOMAIN;

    private constructor(private eamdInstallationDirectory: string) { }

    static async init(domain: string = EAMD_CONSTANTS.DEFAULT_SCENARIO_DOMAIN, eamdInstallationDirectory: string = process.cwd()): Promise<ScenarioInterface> {
        const instance = new DefaultScenario(eamdInstallationDirectory)
        instance.namespace = domain
        return await instance.init()
    }

    static async fromScenarioFolder(scenarioFolder: string, eamdInstallationDirectory: string = process.cwd()): Promise<ScenarioInterface> {
        const instance = new DefaultScenario(eamdInstallationDirectory)
        instance.namespace = relative(join(eamdInstallationDirectory, EAMD_CONSTANTS.SCENARIOS), scenarioFolder).split(sep).join(".")
        return await instance.init()
    }

    get scenarioPath(): string {
        return join(this.eamdInstallationDirectory, EAMD_CONSTANTS.SCENARIOS, join(...this.namespace.split(".")));
    }

    async init(): Promise<ScenarioInterface> {
        existsSync(this.scenarioPath) || mkdirSync(this.scenarioPath, { recursive: true })
        existsSync(this.scenarioJsonFile) || writeFileSync(this.scenarioJsonFile, this.scenarioJsonAsString)
        return this
    }

    private get scenarioJsonFile(): string {
        return join(this.scenarioPath, "scenario.json")
    }

    private get scenarioJsonAsString(): string {
        return JSON.stringify({}, null, 2)
    }
}
