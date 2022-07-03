import DefaultEAMD from "../../1_infrastructure/EAMD.class.mjs";
import EAMD from "../../3_services/UCP/EAMD.interface.mjs";
import DefaultScenario from "../Scenario.class.mjs";
import AbstractDefaultOnce from "./AbstractDefaultOnce.class.mjs";


export abstract class AbstractNodeOnce extends AbstractDefaultOnce {
    ENV: NodeJS.ProcessEnv = process.env;
    global: typeof globalThis;
    eamd: EAMD;

    constructor(eamd: EAMD) {
        super();
        this.global = global;
        this.eamd = eamd;
    }



    static async start(): Promise<AbstractNodeOnce> {
        const eamd = await DefaultEAMD.getInstance(DefaultScenario.Default);
        //@TODO@MERGE ts-ignore should not used
        //@ts-ignore
        return new this(eamd);
    }
}
