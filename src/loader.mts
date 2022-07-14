// ##IGNORE_TRANSFORMER##


// Eine mögliche alternativer Loader ohne direkte abhängichkeit zu Once mit loop Detection

import path from "path";

let DefaultIORClass: any;

enum loaderReturnValue { "default", "path" }

type resolveContext = {
    conditions: string[];
    importAssertions: object;
    parentURL: string | undefined;
};

type loadContext = {
    format: string | null | undefined;
    importAssertions: any;
};

class SourceFile {
    private static _store: { [i: string]: SourceFile } = {};
    importedFiles: SourceFile[] = [];
    static getSourceFile(filePath: string): SourceFile {
        filePath = path.normalize(filePath)
        if (!this._store[filePath]) {
            this._store[filePath] = new SourceFile(filePath)
        }
        return this._store[filePath];
    }

    static foundErrors: { [i: string]: string } = {};


    constructor(public path: string) {

    }

    get dirName() { return path.dirname(this.path) }

    addLoadedFile(filePath: string) {
        const loadedFile = SourceFile.getSourceFile(filePath);
        this.importedFiles.push(loadedFile);
        return loadedFile;
    }

    check4Loop(hitFiles: SourceFile[] = []): boolean {
        hitFiles.push(this);
        for (const file of this.importedFiles) {
            // console.log(`${sourceFile.path} =>  ${file.path} ${file.importedFiles.length}`);
            if (hitFiles.includes(file)) {
                let message = `Detect possible loop relationship!
####### CODE LOOP ############
${hitFiles.map(x => x.path).join(' =>\n')}
##############################`
                let key = hitFiles.map(x => x.path).sort().join('');
                if (!SourceFile.foundErrors[key]) {
                    SourceFile.foundErrors[key] = message;
                    console.warn(message)
                }
                return true;
            } else {
                file.check4Loop([...hitFiles]);
            }
        }
        // console.log("##### END Check #####")
        return false;
    }
}

class OnceSmallNodeImportLoader {

    normalizePath4Url(path: string): string {
        return path.replace(/\.m[tj]s$/, '').replace(/.*\/EAMD\.ucp\//, '').replaceAll('.', '_').replace(/\/([12345]_\w+)/, '.$1');
    }

    async resolve(
        specifier: string,
        context: resolveContext,
        defaultResolve: Function
    ): Promise<{ url: string }> {

        // console.log("RESOLVE:", specifier, context.parentURL);
        if (specifier.startsWith("ior:") || specifier.startsWith("/ior:")) {
            if (DefaultIORClass === undefined) {
                DefaultIORClass = (await import("./2_systems/NewThings/DefaultIOR.class.mjs")).default
            }
            specifier = await DefaultIORClass.load(specifier, { returnValue: loaderReturnValue.path }) as string;
        }

        let result = await defaultResolve(specifier, context, defaultResolve);

        if (context.parentURL) {
            let parent = SourceFile.getSourceFile(context.parentURL)
            let child = parent.addLoadedFile(result.url)
            child.check4Loop();
            console.log("PUML:", `"${this.normalizePath4Url(parent.path)}" =up=> "${this.normalizePath4Url(child.path)}"`);
        }

        return result;
    }

    async load(
        url: string,
        context: loadContext,
        defaultLoad: Function
    ): Promise<{
        format: "builtin" | "commonjs" | "json" | "module" | "wasm";
        source: string | ArrayBuffer | Int8Array;
    }> {
        return defaultLoad(url, context, defaultLoad);
    }
}

let onceSmallNodeImportLoader = new OnceSmallNodeImportLoader();

const load = onceSmallNodeImportLoader.load;
const resolve = onceSmallNodeImportLoader.resolve.bind(onceSmallNodeImportLoader);

export { load, resolve, onceSmallNodeImportLoader }