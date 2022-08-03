// ##IGNORE_TRANSFORMER##

import { mkdirSync, writeFileSync } from "fs";
import path, { basename, dirname, join, relative } from "path";
import DeclarationDescriptor from "./DeclarationDescriptor.class.mjs";
import { VisitorContext } from "./Transformer.interface.mjs";

export default abstract class BaseDescriptorTR {

    visitorContext: VisitorContext
    abstract name: string;
    abstract type: string;


    constructor(visitor: VisitorContext,) {
        this.visitorContext = visitor;
    }

    get exportFilePath(): string {
        let compilerOptions = this.visitorContext.program.getCompilerOptions();
        if (!compilerOptions.outDir)
            throw new Error("Missing compiler option 'outDir'");

        return path.join(compilerOptions.outDir, this.name + '.component.json');
    }
}

export abstract class ExportBaseDescriptorTR extends BaseDescriptorTR {

    abstract export: any
    originalFilePath: string;

    constructor(declarationDescriptor: DeclarationDescriptor) {
        super(declarationDescriptor.visitorContext);
        let sourceFile = declarationDescriptor.sourceFile;
        if (!sourceFile) throw new Error("Missing source file")
        this.originalFilePath = sourceFile.fileName;
    }

    private get exportPath(): string {
        const rootDir = this.visitorContext.componentDescriptor.rootDir
        if (!this.originalFilePath) throw new Error("Missing original file path")
        let fileMatchResult = basename(this.originalFilePath).match(/(.+)\.[mc]?[tj]s$/);
        if (!fileMatchResult) throw new Error("File has wrong format: " + this.originalFilePath);
        let file = fileMatchResult[1] + '.meta.json';

        let outDir = this.visitorContext.program.getCompilerOptions().outDir;
        if (!outDir) throw new Error("Missing CompilerOption outDir")
        let dir = join(outDir, relative(rootDir, dirname(this.originalFilePath)));

        return join(dir, file);
    }
}