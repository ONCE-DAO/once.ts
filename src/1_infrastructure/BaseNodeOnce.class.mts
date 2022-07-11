import BaseOnce from "./BaseOnce.class.mjs";
import DefaultScenario from "../2_systems/Scenario.class.mjs";
import EAMDInterface from "../3_services/EAMD.interface.mjs";
import DefaultEAMD from "./EAMD.class.mjs";

export default abstract class BaseNodeOnce extends BaseOnce {
    ENV: NodeJS.ProcessEnv = process.env;
    global: typeof globalThis;
    eamd: EAMDInterface;

    constructor(eamd: EAMDInterface) {
        super();
        this.global = global;
        this.eamd = eamd;
    }



    static async start(): Promise<BaseNodeOnce> {
        const eamd = await DefaultEAMD.getInstance(DefaultScenario.Default)
        //@TODO@MERGE ts-ignore should not used
        //@ts-ignore
        return new this(eamd);
    }
}