import Once, { OnceMode, OnceState } from "../../3_services/Once.interface.mjs";
import EAMD from "../../3_services/UCP/EAMD.interface.mjs";

export default abstract class AbstractDefaultOnce implements Once {
    abstract ENV: NodeJS.ProcessEnv;
    abstract mode: OnceMode;
    abstract start(): Promise<void>;
    abstract global: typeof globalThis;
    abstract eamd: EAMD;

    creationDate: Date;
    state: OnceState = OnceState.DISCOVER;

    constructor() {
        this.creationDate = new Date();
    }
}
