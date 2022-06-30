import Once, { OnceMode, OnceNodeImportLoader, OnceState } from "../../3_services/Once.interface.mjs";

export default abstract class BaseOnce implements Once {
    abstract ENV: NodeJS.ProcessEnv;
    abstract mode: OnceMode;
    private _onceLoader: OnceNodeImportLoader | undefined;
    abstract start(): Promise<void>;
    abstract global: typeof globalThis;
    // abstract eamd: EAMDInterface;

    get OnceLoader(): OnceNodeImportLoader | undefined { return this._onceLoader };
    set OnceLoader(value: OnceNodeImportLoader | undefined) { this._onceLoader = value; }

    creationDate: Date;
    state: OnceState = OnceState.DISCOVER;

    constructor() {
        this.creationDate = new Date();
    }
}

export abstract class BaseNodeOnce extends BaseOnce {
    ENV: NodeJS.ProcessEnv = process.env;
    global: typeof globalThis;
    // eamd: EAMDInterface;

    // constructor(eamd: EAMDInterface) {
    constructor() {
        super();
        this.global = global;
        throw "not implemented"
        // this.eamd = eamd;
    }



    static async start(): Promise<BaseNodeOnce> {
        throw "not implemented"

        // const eamd = await DefaultEAMD.getInstance(DefaultScenario.Default)
        //@TODO@MERGE ts-ignore should not used
        //@ts-ignore
        return new this(eamd);
    }
}