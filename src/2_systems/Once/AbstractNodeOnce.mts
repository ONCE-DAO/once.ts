import EAMD, { EAMD_CONSTANTS } from "../../3_services/UCP/EAMD.interface.mjs";
import DefaultEAMD from "../UCP/EAMD.class.mjs";
import AbstractDefaultOnce from "./AbstractDefaultOnce.class.mjs";
import OldEAMD from "../../1_infrastructure/EAMD.class.mjs";
import DefaultScenario from "../Things/Scenario.class.mjs";

export abstract class AbstractNodeOnce extends AbstractDefaultOnce {
    eamd: EAMD;
    ENV: NodeJS.ProcessEnv;
    global: typeof globalThis;
    oldEamd: OldEAMD;;

    static async start(): Promise<AbstractNodeOnce> {
        const scenarioDomain = process.env.SCENARIO_DOMAIN || EAMD_CONSTANTS.DEFAULT_SCENARIO_DOMAIN
        const basePath = process.env.BASE_PATH || process.cwd()
        const eamd = await DefaultEAMD.init(basePath,scenarioDomain);
        const oldEamd  = await OldEAMD.getInstance(DefaultScenario.Default)

        //@TODO find solution for abstract class initializer
        //@ts-ignore
        return new this(eamd, oldEamd);
    }

    constructor(eamd: DefaultEAMD, oldEAMD: OldEAMD) {
        super();
        this.global = global;
        this.eamd = eamd;
        this.ENV = process.env
        this.oldEamd = oldEAMD
    } 
}
