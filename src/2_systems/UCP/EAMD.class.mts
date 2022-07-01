import EAMDInterface, { EAMD_CONSTANTS } from "../../3_services/UCP/EAMD.interface.mjs";
import Scenario from "../../3_services/UCP/Scenario.interface.mjs";
import DefaultFolder from "../File/Folder.class.mjs";
import { Async } from "./Async.mjs";
import { DefaultScenario } from "./Scenario.class.mjs";

export default class DefaultEAMD implements EAMDInterface {
    currentScenario: Scenario;

    static async init(installationDirectory: string = process.cwd(), currentScenarioNamespace: string = EAMD_CONSTANTS.DEFAULT_SCENARIO_DOMAIN): Promise<EAMDInterface> {
        return new DefaultEAMD(installationDirectory, await DefaultScenario.init(currentScenarioNamespace, installationDirectory))
    }

    constructor(private installationDirectory: string, currentScenario: Scenario) {
        this.currentScenario = currentScenario;
    }

    get scenarios(): Promise<Scenario[]> {
        return Async.Property<Scenario[]>(async () =>
            await Promise.all(DefaultFolder.getFilesByFileName(this.installationDirectory, ["scenario.json"], true)
                .map(async (file) => await DefaultScenario.fromScenarioFolder(file.basePath, this.installationDirectory)))
        )
    }
}
