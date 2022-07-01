import { resolve } from "path";
import EAMDInterface from "../../3_services/UCP/EAMD.interface.mjs";
import Scenario from "../../3_services/UCP/Scenario.interface.mjs";
import DefaultFolder from "../File/Folder.class.mjs";
import { Async } from "./Async.mjs";
import { DefaultScenario } from "./Scenario.class.mjs";

export default class DefaultEAMD implements EAMDInterface {
    static async init(installationDirectory: string = process.cwd()): Promise<EAMDInterface> {
        const instance = new DefaultEAMD(installationDirectory)
        return await instance.init();
    }

    constructor(private installationDirectory: string) {
    }


    // get scenarios(): Promise<Scenario[]> {
    //     return new Promise<Scenario[]>(async (resolve, reject) => {
    //         try {
    //             const f = await Promise.all(DefaultFolder.getFilesByFileName(this.installationDirectory, ["scenario.json"], true)
    //                 .map(async (file) => await DefaultScenario.fromScenarioFolder(file.basePath, this.installationDirectory)))
    //             resolve(f);
    //         } catch (error) {
    //             reject(error)
    //         }
    //     })
    // }


    get scenarios(): Promise<Scenario[]> {
        return Async.Property<Scenario[]>(async () =>
            await Promise.all(DefaultFolder.getFilesByFileName(this.installationDirectory, ["scenario.json"], true)
                .map(async (file) => await DefaultScenario.fromScenarioFolder(file.basePath, this.installationDirectory)))
        )
    }

    async init(): Promise<EAMDInterface> {
        return this;
    }
}


