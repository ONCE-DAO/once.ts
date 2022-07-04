import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, relative, sep } from "path";
import { EAMD_CONSTANTS } from "../../3_services/UCP/EAMD.interface.mjs";
import ScenarioInterface from "../../3_services/UCP/Scenario.interface.mjs";
import UcpComponentDescriptorExportInterface, { UcpComponentDescriptorInterface } from "../../3_services/UCP/UcpComponentDescriptor.interface.mjs";
import DefaultFolder from "../File/Folder.class.mjs";
import { Async } from "./Async.mjs";
import DefaultUcpComponentDescriptor from "./DefaultUcpComponentDescriptor.class.mjs";

export class DefaultScenario implements ScenarioInterface {
    namespace: string = EAMD_CONSTANTS.DEFAULT_SCENARIO_DOMAIN;

    private constructor(private eamdInstallationDirectory: string) { }
    get webRoot(): string {
        return this.scenarioPath;
    }

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

    get componentDescriptors(): Promise<UcpComponentDescriptorInterface[]> {
        return Async.Property<UcpComponentDescriptorInterface[]>(async () =>
            Promise.all((await Promise
                .all(DefaultFolder.getFilesByOnceExtentions(this.scenarioPath, [".component.json"], true)))
                .map(file => file.fullPath)
                .map(path => ({ jsonString: readFileSync(path).toString(), path: relative(this.scenarioPath, path) }))
                .map(async ({ jsonString, path }) => {
                    let descriptor = (JSON.parse(jsonString) as UcpComponentDescriptorExportInterface)
                    return await new DefaultUcpComponentDescriptor(descriptor, path) as UcpComponentDescriptorInterface
                }))
        );
    }
}
