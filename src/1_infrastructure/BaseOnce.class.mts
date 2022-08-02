import DefaultNamespace from "../2_systems/Namespace/DefaultNamespace.class.mjs";
import EAMDInterface from "../3_services/EAMD.interface.mjs";
import NamespaceInterface from "../3_services/Namespace/Namespace.interface.mjs";
import Once, { OnceMode, OnceNodeImportLoader, OnceState } from "../3_services/Once.interface.mjs";
import EAMDInterface2 from "../3_services/UCP/EAMD.interface.mjs";

export default abstract class BaseOnce implements Once {
    abstract ENV: NodeJS.ProcessEnv;
    abstract mode: OnceMode;
    private _onceLoader: OnceNodeImportLoader | undefined;
    abstract global: typeof globalThis;
    abstract eamd: EAMDInterface2;

    get OnceLoader(): OnceNodeImportLoader | undefined { return this._onceLoader };
    set OnceLoader(value: OnceNodeImportLoader | undefined) { this._onceLoader = value; }

    creationDate: Date;
    state: OnceState = OnceState.DISCOVER;

    async start(): Promise<void> {
        this.global.ONCE = this;
        await this.rootNamespace.discover(undefined, { recursive: true });
    }

    constructor() {
        this.creationDate = new Date();
        this.rootNamespace = new DefaultNamespace();
    }

    rootNamespace: NamespaceInterface;
    abstract oldEamd: EAMDInterface;
    get isNodeJSEnvironment(): boolean {
        throw new Error("Method not implemented.");
    }
}

