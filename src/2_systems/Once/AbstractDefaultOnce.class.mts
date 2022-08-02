import OLD_EAMD from "../../3_services/EAMD.interface.mjs";
import NamespaceInterface from "../../3_services/Namespace/Namespace.interface.mjs";
import Once, { OnceMode, OnceState } from "../../3_services/Once.interface.mjs";
import EAMD from "../../3_services/UCP/EAMD.interface.mjs";
import DefaultNamespace from "../Namespace/DefaultNamespace.class.mjs";

export default abstract class AbstractDefaultOnce implements Once {
    abstract ENV: NodeJS.ProcessEnv;
    abstract mode: OnceMode;
    abstract global: typeof globalThis;
    abstract eamd: EAMD;
    abstract oldEamd: OLD_EAMD;

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

    get isNodeJSEnvironment(): boolean {
        return this.mode === OnceMode.NODE_LOADER || this.mode === OnceMode.TEST_ENVIRONMENT || this.mode === OnceMode.NODE_JS
    }
}
