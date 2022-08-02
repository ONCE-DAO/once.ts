// ##IGNORE_TRANSFORMER##

import TS from 'typescript';
import ComponentDescriptorTR from '../ComponentDescriptor.class.mjs';
import { TSNodeVisitor, VisitorContext } from '../Transformer.interface.mjs';


// const onceIOR = "ior:esm:/tla.EAM.Once[build]";
/**
 * When using a basic NodeTransformer some helpful context will be provided as the second parameter
 */
export default abstract class BaseVisitor implements TSNodeVisitor {
    static implementations = new Array();

    public context: VisitorContext;
    constructor(aContext: VisitorContext) {
        this.context = aContext;
    }

    abstract visit(node: TS.Node): TS.VisitResult<TS.Node>;

    get componentDescriptor(): ComponentDescriptorTR {
        return this.context.componentDescriptor;
    }


    static get validTSSyntaxKind(): TS.SyntaxKind {
        throw new Error("Not implemented yet");
    }

    getFile4NodeObject(object: TS.Node): TS.SourceFile {
        if (TS.isSourceFile(object)) {
            return object;
        } else if (object.parent) {
            return this.getFile4NodeObject(object.parent);
        } else {
            throw new Error("Missing Parent")
        }
    }

    createDefaultImportNode(name: string, importPath: string): TS.ImportDeclaration {
        return TS.factory.createImportDeclaration(
            undefined,
            undefined,
            TS.factory.createImportClause(
                false,
                TS.factory.createIdentifier(name),
                undefined
            ),
            TS.factory.createStringLiteral(importPath),
            undefined
        );
    }

    createNamedImportNode(name: string, importPath: string): TS.ImportDeclaration {
        return TS.factory.createImportDeclaration(
            undefined,
            undefined,
            TS.factory.createImportClause(
                false,
                undefined,
                TS.factory.createNamedImports([TS.factory.createImportSpecifier(
                    false,
                    undefined,
                    TS.factory.createIdentifier(name)
                )])
            ),
            TS.factory.createStringLiteral(importPath),
            undefined
        );
    }
}
