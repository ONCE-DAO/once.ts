import OLD_EAMD from "../../3_services/EAMD.interface.mjs";
import NamespaceInterface, { NamespaceObjectTypeName } from "../../3_services/Namespace/Namespace.interface.mjs";
import VersionFolder from "../../3_services/Namespace/VersionFolder.interface.mjs";
import Once, { OnceMode, OnceState } from "../../3_services/Once.interface.mjs";
import EAMD from "../../3_services/UCP/EAMD.interface.mjs";
import DefaultNamespace from "../Namespace/DefaultNamespace.class.mjs";
import DefaultVersion from "../Namespace/DefaultVersion.class.mjs";

export default abstract class AbstractDefaultOnce implements Once {
    abstract ENV: NodeJS.ProcessEnv;
    abstract mode: OnceMode;
    abstract global: typeof globalThis;
    abstract eamd: EAMD;
    abstract oldEamd: OLD_EAMD;

    creationDate: Date;
    state: OnceState = OnceState.DISCOVER;
    private _version: VersionFolder | undefined;

    async start(setStateSTARTED: boolean = true): Promise<void> {
        this.global.ONCE = this;
        await this.rootNamespace.discover(undefined, { recursive: true });
        if (setStateSTARTED) this.state = OnceState.STARTED;
    }

    get version(): VersionFolder {
        if (!this._version) {
            if (this.isNodeJSEnvironment) {
                let fileName = import.meta.url;
                let location: string[] = [];
                let matchResult = fileName.match(/\/Components\/(.+\/Once)\/once@([^\/]+)/);
                if (matchResult) {
                    location = [...matchResult[1].split("/"), matchResult[2]];
                } else {
                    let matchResult2 = fileName.match(/\/Scenarios\/.+\/(tla.*?\/Once\/[^\/]+)/);
                    if (matchResult2) location = matchResult2[1].split("/");
                }
                if (!location.length) throw new Error("Fail to identify Once Path");
                const existingVersion = this.rootNamespace.search(location);
                if (existingVersion && "version" in existingVersion && existingVersion.objectType == NamespaceObjectTypeName.VersionFolder) {
                    this._version = existingVersion;
                    return existingVersion
                }
                this._version = new DefaultVersion();
                this._version.name = location[location.length - 1];
                this.rootNamespace.add(this._version, location)
            } else {
                throw new Error("Not implemented");
            }
        }
        return this._version;
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
