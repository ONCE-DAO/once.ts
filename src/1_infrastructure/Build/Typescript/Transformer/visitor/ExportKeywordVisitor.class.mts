// ##IGNORE_TRANSFORMER##

import TS from 'typescript';
import ComponentDescriptorTR from '../ComponentDescriptor.class.mjs';
import { TSNodeVisitor } from '../Transformer.interface.mjs';
import BaseVisitor from './BaseVisitor.class.mjs';

export default class ExportKeywordVisitor extends BaseVisitor implements TSNodeVisitor {

    static get validTSSyntaxKind(): TS.SyntaxKind {
        return TS.SyntaxKind.ExportKeyword;
    }

    static {
        BaseVisitor.implementations.push(this);
    }

    get typeChecker() {
        return this.context.program.getTypeChecker();
    }


    visit(node: TS.ExportKeyword): TS.VisitResult<TS.Node> {
        let parent = node.parent;
        let cd = ComponentDescriptorTR.getComponentDescriptor(node, this.context);

        if (this.context.fileVisitor.phase === "before") {

            if (TS.isInterfaceDeclaration(parent)) {
                cd.addExport(this.context.fileVisitor.sourceFile, parent.name);
            } else if (TS.isClassDeclaration(parent) && parent.name !== undefined) {
                cd.addExport(this.context.fileVisitor.sourceFile, parent.name);
            } else if (TS.isEnumDeclaration(parent) && parent.name !== undefined) {
                cd.addExport(this.context.fileVisitor.sourceFile, parent.name);
            } else if (TS.isTypeAliasDeclaration(parent)) {
                cd.addExport(this.context.fileVisitor.sourceFile, parent.name);
            } else if (TS.isVariableStatement(parent)) {
                // Not implemented Yet
            } else {
                cd;
            }
        }
        return node;

    }


}
