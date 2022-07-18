import path from "path";

export default class SourceFile {
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
        if (this.path.endsWith("FileSystemLoader.class.mjs")) return false; // This is the loader
        hitFiles.push(this);
        for (const file of this.importedFiles) {
            // console.log(`${sourceFile.path} =>  ${file.path} ${file.importedFiles.length}`);
            if (hitFiles.includes(file)) {
                let loopList: SourceFile[] = hitFiles.slice(hitFiles.indexOf(file))
                let key = loopList.map(x => x.path).sort().join('');
                if (!SourceFile.foundErrors[key]) {
                    let message = `Detect possible loop relationship!
    ####### CODE LOOP ############
    ${[...loopList, file].map(x => x.path).join(' =>\n    ')}
    ##############################`
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