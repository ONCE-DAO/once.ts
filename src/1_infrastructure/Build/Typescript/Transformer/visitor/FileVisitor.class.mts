// ##IGNORE_TRANSFORMER##

import path from 'path';
import TS from 'typescript';
import DefaultFileUcpUnit from '../../../../../2_systems/Things/FileUnit.class.mjs';
import FileUcpUnit from '../../../../../3_services/UCP/FileUcpUnit.interface.mjs';
import { UnitType } from '../../../../../3_services/UCP/UcpUnit.interface.mjs';
import ComponentDescriptorTR from '../ComponentDescriptor.class.mjs';
import DeclarationDescriptor from '../DeclarationDescriptor.class.mjs';
import { VisitorContext } from '../Transformer.interface.mjs';
import { debug } from '../Transformer.mjs';
import TranspileFactory from '../TranspileFactorys.class.mjs';
import BaseVisitor from './BaseVisitor.class.mjs';
import CallExpressionVisitor from './CallExpressionVisitor.class.mjs';
import ClassVisitor from './ClassVisitor.class.mjs';
import ExportKeywordVisitor from './ExportKeywordVisitor.class.mjs';
import ExportVisitor from './ExportVisitor.class.mjs';
import ImportVisitor from './ImportVisitor.class.mjs';
import InterfaceVisitor from './InterfaceVisitor.class.mjs';

CallExpressionVisitor
ClassVisitor
ExportKeywordVisitor
ExportVisitor
ImportVisitor
InterfaceVisitor

export default class FileVisitor {
    private _componentDescriptor: ComponentDescriptorTR | undefined;
    private _isNodeJs: boolean | undefined;
    private _context: TS.TransformationContext | undefined;
    phase: "before" | "after" = "before";
    program: TS.Program | undefined;
    private _visitorContext: VisitorContext | undefined;
    private _fileUnit: DefaultFileUcpUnit | undefined;

    constructor(public sourceFile: TS.SourceFile) {
    }
    init(context: TS.TransformationContext, phase: "before" | "after", program: TS.Program): this {
        this._context = context;
        this.phase = phase;
        this.program = program;
        this._componentDescriptor = ComponentDescriptorTR.getComponentDescriptor(this.sourceFile, this.visitorContext);
        if (this._visitorContext)
            this._visitorContext.componentDescriptor = this._componentDescriptor;
        return this;
    }

    get componentDescriptor(): ComponentDescriptorTR {
        if (!this._componentDescriptor) throw new Error("Missing component descriptor. Require Init")
        return this._componentDescriptor;
    }

    get context(): TS.TransformationContext {
        if (!this._context) throw new Error("Missing context. Require Init")
        return this._context;
    }

    get isOnceFile(): boolean {
        return this.sourceFile.fileName.toLowerCase().includes("once/once@")
    }

    add2Header(key: string, node: TS.ImportDeclaration): void {
        this.addItionalHeader[key] = node;
    }

    addItionalHeader: Record<string, TS.ImportDeclaration> = {};

    transform() {
        if (debug)
            console.log("myTransformer " + this.phase, this.sourceFile.fileName);
        if (this.sourceFile.fileName.match('/zod/'))
            return this.sourceFile;

        // let isNodeJs = this.isNodeJs();
        // console.log(`isNodeJs ${this.sourceFile.fileName} = ${isNodeJs}`);
        if (this.sourceFile.getFullText().match(/\/\/ *##IGNORE_TRANSFORMER##/))
            return this.sourceFile;

        TranspileFactory.fileUnitFactory(this.sourceFile, this.visitorContext)

        this.sourceFile = TS.visitNode(this.sourceFile, this.visitor.bind(this));

        let allImportVariables: string[] = this.getAllImportedVariables();
        if (debug)
            console.log("existingImports:  " + this.sourceFile.fileName, allImportVariables);

        // let allClasses: string[] = this.getAllClasses();
        let importVariables = Object.keys(this.addItionalHeader).filter(key => !allImportVariables.includes(key));
        let newImports = importVariables.map(key => this.addItionalHeader[key]);
        if (debug)
            console.log("AddImports:  ", importVariables);

        if (newImports.length > 0) {
            this.sourceFile = TS.factory.updateSourceFile(this.sourceFile, [...newImports, ...this.sourceFile.statements]);
        }

        return this.sourceFile;
    }


    isNodeJs(alreadyHitSourceFiles: TS.SourceFile[] = []): boolean {
        if (this._isNodeJs === undefined) {
            alreadyHitSourceFiles.push(this.sourceFile);
            let existingImports = this.sourceFile.statements.filter(x => TS.isImportDeclaration(x)) as TS.ImportDeclaration[];
            existingImports.forEach(importDeclaration => {
                if (importDeclaration?.importClause?.namedBindings && TS.isNamedImports(importDeclaration.importClause.namedBindings)) {
                    for (const namedElement of importDeclaration.importClause.namedBindings.elements) {
                        let dd = new DeclarationDescriptor(namedElement.name, this.visitorContext);
                        if (dd.isNodeJs(alreadyHitSourceFiles) === true)
                            this._isNodeJs = true;
                    }
                }
            });
        }
        return this._isNodeJs || false;
    }

    private getAllImportedVariables(): string[] {
        let existingImports = this.sourceFile.statements.filter(x => TS.isImportDeclaration(x)) as TS.ImportDeclaration[];

        let allImportVariables: string[] = [];

        existingImports.forEach(importDeclaration => {
            const elements = (importDeclaration.importClause?.namedBindings as TS.NamedImports)?.elements || [];
            for (const element of elements) {
                allImportVariables.push(element.name.escapedText as string);
            }
            const defaultImport = importDeclaration.importClause?.name?.escapedText;
            if (defaultImport !== undefined)
                allImportVariables.push(defaultImport as string);
        });
        return allImportVariables;
    }

    get visitorContext(): VisitorContext {
        if (!this._visitorContext) {
            if (this.program === undefined) throw new Error("Missing program")

            this._visitorContext = {
                transformationContext: this.context,
                sourceFile: this.sourceFile,
                program: this.program,
                fileVisitor: this,
                //@ts-ignore
                componentDescriptor: this._componentDescriptor
            }

        }
        //@ts-ignore
        return this._visitorContext;
    }

    visitor(node: TS.Node): TS.VisitResult<TS.Node> {

        let visitorList = BaseVisitor.implementations.filter(aTSNodeVisitor => aTSNodeVisitor.validTSSyntaxKind === node.kind);
        if (visitorList.length > 1)
            throw new Error("Can not have more then one visitor");

        let myVisitor = visitorList.map(aTSNodeVisitorType => new aTSNodeVisitorType(this.visitorContext));

        if (TS.isInterfaceDeclaration(node)) {
            if (debug)
                console.log("  Node", TS.SyntaxKind[node.kind], this.sourceFile.text.substring(node.pos, node.end).replace('\n', ''));
        }

        if (myVisitor.length > 0) {
            return myVisitor[0].visit(node);
        }

        let result = TS.visitEachChild(node, this.visitor.bind(this), this.context);
        return result;
    }

}
