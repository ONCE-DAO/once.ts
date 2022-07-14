import OLD_EAMD from "../../3_services/EAMD.interface.mjs";
import Once, { OnceMode, OnceState } from "../../3_services/Once.interface.mjs";
import EAMD from "../../3_services/UCP/EAMD.interface.mjs";
import EAMDLoader from "../Loader/ServerSideEAMDLoader.class.mjs";

export default abstract class AbstractDefaultOnce implements Once {
    abstract ENV: NodeJS.ProcessEnv;
    abstract mode: OnceMode;
    abstract start(): Promise<void>;
    abstract global: typeof globalThis;
    abstract eamd: EAMD;
    abstract oldEamd: OLD_EAMD;

    creationDate: Date;
    state: OnceState = OnceState.DISCOVER;

    constructor() {
        this.creationDate = new Date();
    }

    get isNodeJSEnvironment(): boolean {
        return this.mode === OnceMode.NODE_LOADER || this.mode === OnceMode.TEST_ENVIRONMENT || this.mode === OnceMode.NODE_JS
    }
}
