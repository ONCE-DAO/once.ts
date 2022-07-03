import Once, { OnceMode, OnceNodeImportLoader, OnceState } from "../../3_services/Once.interface.mjs";
import EAMD from "../../3_services/UCP/EAMD.interface.mjs";

export default abstract class AbstractDefaultOnce implements Once {
    abstract ENV: NodeJS.ProcessEnv;
    abstract mode: OnceMode;
    private _onceLoader: OnceNodeImportLoader | undefined;
    abstract start(): Promise<void>;
    abstract global: typeof globalThis;
    abstract eamd: EAMD;

    get OnceLoader(): OnceNodeImportLoader | undefined { return this._onceLoader };
    set OnceLoader(value: OnceNodeImportLoader | undefined) { this._onceLoader = value; }

    creationDate: Date;
    state: OnceState = OnceState.DISCOVER;

    constructor() {
        this.creationDate = new Date();
    }
}

