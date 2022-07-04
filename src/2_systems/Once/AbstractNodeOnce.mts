import EAMD, { EAMD_CONSTANTS } from "../../3_services/UCP/EAMD.interface.mjs";
import DefaultEAMD from "../UCP/EAMD.class.mjs";
import AbstractDefaultOnce from "./AbstractDefaultOnce.class.mjs";

export abstract class AbstractNodeOnce extends AbstractDefaultOnce {
    eamd: EAMD;
    ENV: NodeJS.ProcessEnv;
    global: typeof globalThis;

    constructor(eamd: DefaultEAMD) {
        super();
        this.global = global;
        this.eamd = eamd;
        this.ENV = process.env
    }

    static async start(): Promise<AbstractNodeOnce> {
        const scenarioDomain = process.env.SCENARIO_DOMAIN || EAMD_CONSTANTS.DEFAULT_SCENARIO_DOMAIN
        const basePath = process.env.BASE_PATH || process.cwd()
        const eamd = await DefaultEAMD.init(basePath,scenarioDomain);

        //@TODO find solution for abstract class initializer
        //@ts-ignore
        return new this(eamd);
    }
}
