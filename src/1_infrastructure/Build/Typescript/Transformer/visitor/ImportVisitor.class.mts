// ##IGNORE_TRANSFORMER##

import TS from 'typescript';
import { TSNodeVisitor } from '../Transformer.interface.mjs';
import BaseVisitor from './BaseVisitor.class.mjs';


export default class ImportVisitor extends BaseVisitor implements TSNodeVisitor {

    static get validTSSyntaxKind(): TS.SyntaxKind {
        return TS.SyntaxKind.ImportDeclaration;
    }

    static {
        BaseVisitor.implementations.push(this);
    }

    private readonly allowedExtensions = ['.interface', '.class', '.interface.mjs', '.class.mjs'];

    visit(node: TS.ImportDeclaration): TS.VisitResult<TS.Node> {

        if (this.context.fileVisitor.phase === "before")
            return node;

        // if (this.context.sourceFile.fileName.match('/test/')) {
        //   if (debug) console.log("No update for import on File: " + this.context.sourceFile.fileName)
        //   return node;
        // }
        //@ts-ignore
        // if (debug)
        // console.log("my transformer" + node.kind + ' : ' + node.moduleSpecifier.text);


        if (this.shouldMutateModuleSpecifier(node)) {
            if (TS.isImportDeclaration(node)) {
                this.context.componentDescriptor.addIORDependency(node.moduleSpecifier.text);

                const newModuleSpecifier = TS.factory.createStringLiteral(`/${node.moduleSpecifier.text}`);
                return TS.factory.updateImportDeclaration(node, node.decorators, node.modifiers, node.importClause, newModuleSpecifier, undefined);
            }
        }
        let fileVisitor = this.context.fileVisitor;
        return TS.visitEachChild(node, fileVisitor.visitor.bind(fileVisitor), fileVisitor.context);

    }

    shouldMutateModuleSpecifier(node: TS.Node): node is (TS.ImportDeclaration | TS.ExportDeclaration) & { moduleSpecifier: TS.StringLiteral; } {
        if (!TS.isImportDeclaration(node) && !TS.isExportDeclaration(node))
            return false;
        if (node.moduleSpecifier === undefined)
            return false;
        // only when module specifier is valid
        if (!TS.isStringLiteral(node.moduleSpecifier))
            return false;
        // only when path is relative
        if (!node.moduleSpecifier.text.startsWith('ior:esm:'))
            return false;
        return true;
    }

}
