import DefaultEAMD from "../../1_infrastructure/EAMD.class.mjs";
import EAMDInterface from "../../3_services/EAMD.interface.mjs";
import Once, { OnceMode, OnceState } from "../../3_services/Once.interface.mjs";
import DefaultScenario from "../Scenario.class.mjs";

export default abstract class BaseOnce implements Once {
    abstract ENV: NodeJS.ProcessEnv;
    abstract mode: OnceMode;
    abstract start(): Promise<void>;
    abstract global: typeof globalThis;
    abstract eamd: EAMDInterface;

    creationDate: Date;
    state: OnceState = OnceState.DISCOVER;

    constructor() {
        this.creationDate = new Date();
    }
}

export abstract class BaseNodeOnce extends BaseOnce {
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