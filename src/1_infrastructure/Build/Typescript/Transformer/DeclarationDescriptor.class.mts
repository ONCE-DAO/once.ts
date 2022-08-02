// ##IGNORE_TRANSFORMER##

import path, { relative } from "path";
import TS from 'typescript';
import InterfaceDescriptor from '../../../../2_systems/Things/InterfaceDescriptor.class.mjs';
import InterfaceDescriptorHandler from "../../../../2_systems/Things/InterfaceDescriptorHandler.class.mjs";
import InterfaceDescriptorInterface from '../../../../3_services/Thing/InterfaceDescriptor.interface.mjs';
import BaseDescriptorTR from './BaseDescriptorTR.class.mjs';
import ComponentDescriptorTR from './ComponentDescriptor.class.mjs';
import { VisitorContext } from './Transformer.interface.mjs';
import FileVisitor from './visitor/FileVisitor.class.mjs';



export default class DeclarationDescriptor extends BaseDescriptorTR {
    write2File(): void {
        throw new Error('Method not implemented.');
    }
    type = '';
    path!: string;
    name!: string;
    componentDescriptor!: ComponentDescriptorTR;

    tsType!: TS.Type;

    originalNodeObject: TS.Node | undefined;
    private _isNodeJs: boolean | undefined;
    get location(): string {
        return this.path.replace(/^\/?src\/?/, '');
    }

    get packageAndLocation(): string[] {
        const componentScenarioPath = (relative(ONCE.eamd.currentScenario.scenarioPath, this.componentDescriptor.outDir)).split('/')
        //this.componentDescriptor.name, this.componentDescriptor.version,
        let location = this.location.split('/');
        //Remove Filename 
        location.pop();
        const result = [...componentScenarioPath, ...location, this.name]
        return result;
    }

    constructor(public identifier: TS.Identifier, visitorContext: VisitorContext) {
        super(visitorContext)
        this.init();
    }

    get typeChecker() {
        return this.visitorContext.program.getTypeChecker();
    }

    interfaceDescriptorFactory(): InterfaceDescriptorInterface | undefined {
        if (!this.originalNodeObject) throw new Error("Missing originalNodeObject");
        if (!TS.isInterfaceDeclaration(this.originalNodeObject)) return undefined;

        try {
            return InterfaceDescriptorHandler.getInterfaceDescriptor(this.packageAndLocation)
        } catch (e) {

        }

        return new InterfaceDescriptor().init(this);
    }

    isNodeJs(alreadyHitSourceFiles: TS.SourceFile[] = []): boolean {

        if (this._isNodeJs === undefined) {
            if (this.path.match('node_modules') !== null) {
                this._isNodeJs = true;
            } else {
                if (!this.sourceFile)
                    throw new Error("Missing sourceFile");
                if (alreadyHitSourceFiles.includes(this.sourceFile))
                    return false;
                alreadyHitSourceFiles.push(this.sourceFile);
                this._isNodeJs = new FileVisitor(this.sourceFile).isNodeJs(alreadyHitSourceFiles);
            }

        }
        return this._isNodeJs;
    }

    static MISSING_DECLARATION = "MissingDeclarations";

    init(): this {
        this.tsType = this.typeChecker.getTypeAtLocation(this.identifier);
        if (!this.tsType.symbol?.declarations) {
            this.name = DeclarationDescriptor.MISSING_DECLARATION;
            this.path = this.identifier.text;
            this.componentDescriptor = new ComponentDescriptorTR(this.visitorContext);
            return this;
        }

        this.originalNodeObject = this.tsType.symbol.declarations[0] as TS.Node;

        let sourceFile = this.sourceFile;
        if (!sourceFile)
            throw new Error("Missing source file");

        this.componentDescriptor = ComponentDescriptorTR.getComponentDescriptor(sourceFile.fileName, this.visitorContext);


        if ((TS.isInterfaceDeclaration(this.originalNodeObject) || TS.isClassDeclaration(this.originalNodeObject)) && typeof this.originalNodeObject.name !== "undefined") {
            this.name = this.originalNodeObject.name.escapedText as string;
        } else {
            this.name = this.tsType.symbol.name;

        }
        this.path = path.relative(this.componentDescriptor.packagePath, this.normalizeFile(sourceFile.fileName));

        return this;
    }

    get sourceFile(): TS.SourceFile | undefined {
        if (this.originalNodeObject === undefined)
            return undefined;
        return DeclarationDescriptor.getFile4NodeObject(this.originalNodeObject);
    }

    private normalizeFile(filePath: string): string {
        return filePath.replace(/(\.d)?\.mts$/, '.mjs');
    }

    static getFile4NodeObject(object: TS.Node): TS.SourceFile {
        if (TS.isSourceFile(object)) {
            return object;
        } else if (object.parent) {
            return this.getFile4NodeObject(object.parent);
        } else {
            throw new Error("Missing Parent")
        }
    }
}
