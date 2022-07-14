import BaseOnce from "./BaseOnce.class.mjs";
import DefaultEAMD from "./EAMD.class.mjs";
import DefaultScenario from "../2_systems/Things/Scenario.class.mjs";
import EAMDInterface from "../3_services/UCP/EAMD.interface.mjs";

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