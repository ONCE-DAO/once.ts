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