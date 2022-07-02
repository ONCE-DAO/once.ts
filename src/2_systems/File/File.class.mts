import File from "../../3_services/File/File.interface.mjs";
import { existsSync, writeFileSync, readFileSync } from 'fs';
import path, { basename, dirname, extname } from 'path';

export default class NodeFile implements File {
    fullPath: string;

    constructor(path: string = "") {
        this.fullPath = path
    }
    get onceExtension(): string {
        return basename(this.fullPath).substring(basename(this.fullPath).indexOf("."))
    }

    get exists() {
        return existsSync(this.fullPath)
    }

    get extension() {
        return extname(this.fullPath)
    }

    get filename(): string {
        return basename(this.fullPath)
    }

    get basePath(): string {
        return dirname(this.fullPath)
    }

    write(content: string): void {
        writeFileSync(this.fullPath, content)
    }
    read(): string {
        return readFileSync(this.fullPath).toString()
    }

} 