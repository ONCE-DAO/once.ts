import Once, { OnceMode, OnceState } from "../../../../../../../../Scenarios/localhost/tla/EAM/Thinglish/dev/3_services/Once.interface.mjs";

export default abstract class BaseOnce implements Once {
    abstract ENV: NodeJS.ProcessEnv;
    abstract mode: OnceMode;
    abstract start(): Promise<void>;
    abstract global: typeof globalThis;

    creationDate: Date;
    state: OnceState = OnceState.DISCOVER;

    constructor() {
        this.creationDate = new Date();
    }
}

export abstract class BaseNodeOnce extends BaseOnce {
    ENV: NodeJS.ProcessEnv = process.env;
    global: typeof globalThis;

    constructor() {
        super();
        this.global = global;
    }
}