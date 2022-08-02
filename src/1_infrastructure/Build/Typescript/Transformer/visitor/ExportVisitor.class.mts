// ##IGNORE_TRANSFORMER##

import TS from 'typescript';
import path from "path";
import ComponentDescriptorTR from '../ComponentDescriptor.class.mjs';
import { TSNodeVisitor } from '../Transformer.interface.mjs';
import { jsExtension } from '../Transformer.mjs';
import BaseVisitor from './BaseVisitor.class.mjs';


export default class ExportVisitor extends BaseVisitor implements TSNodeVisitor {

    static get validTSSyntaxKind(): TS.SyntaxKind {
        return TS.SyntaxKind.ExportDeclaration;
    }

    static {
        BaseVisitor.implementations.push(this);
    }

    get typeChecker() {
        return this.context.program.getTypeChecker();
    }

    private readonly allowedExtensions = ['.interface', '.class', '.interface.mjs', '.class.mjs'];

    visit(node: TS.ExportDeclaration): TS.VisitResult<TS.Node> {

        if (this.context.fileVisitor.phase === "before") {
            if (node.exportClause && "elements" in node.exportClause) {
                let sourceFile = this.getFile4NodeObject(node);
                let cd = ComponentDescriptorTR.getComponentDescriptor(node, this.context);
                for (let element of node.exportClause.elements) {
                    //let dd = new DeclarationDescriptor(element.name, this.context);
                    cd.addExport(sourceFile, element.name);
                }
            }
            return node;
        }

        // if (this.context.sourceFile.fileName.match('/test/')) {
        //   if (debug) console.log("No update for import on File: " + this.context.sourceFile.fileName)
        //   return node;
        // }
        // if (debug) console.log("my transformer for EXPORT " + node.getFullText())
        const doAddJS = this.shouldMutateModuleSpecifier(node);
        if (doAddJS) {
            const newModuleSpecifier = TS.factory.createStringLiteral(`${node.moduleSpecifier.text}.js`);
            return TS.factory.updateExportDeclaration(node, node.decorators, node.modifiers, node.isTypeOnly, node.exportClause, newModuleSpecifier, node.assertClause);
        }


        return node;

    }

    shouldMutateModuleSpecifier(node: TS.ExportDeclaration): node is (TS.ExportDeclaration) & { moduleSpecifier: TS.StringLiteral; } {
        if (jsExtension === false)
            return false;
        if (node.moduleSpecifier === undefined)
            return false;
        // only when module specifier is valid
        if (!TS.isStringLiteral(node.moduleSpecifier))
            return false;
        // only when path is relative
        if (!node.moduleSpecifier.text.startsWith('./') && !node.moduleSpecifier.text.startsWith('../'))
            return false;
        // only when module specifier has no extension
        const ext = path.extname(node.moduleSpecifier.text);
        if (ext !== '' && !this.allowedExtensions.includes(ext))
            return false;
        return true;
    }

}
