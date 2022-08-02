// ##IGNORE_TRANSFORMER##

import TS from 'typescript';
import DeclarationDescriptor from '../DeclarationDescriptor.class.mjs';
import { TSNodeVisitor } from '../Transformer.interface.mjs';

import BaseVisitor from './BaseVisitor.class.mjs';

export default class CallExpressionVisitor extends BaseVisitor implements TSNodeVisitor {

    static get validTSSyntaxKind(): TS.SyntaxKind {
        return TS.SyntaxKind.CallExpression;
    }

    static {
        BaseVisitor.implementations.push(this);
    }

    visit(node: TS.CallExpression): TS.VisitResult<TS.Node> {
        let fileVisitor = this.context.fileVisitor;

        if (this.context.fileVisitor.phase === "before") {

            // getInterfaceDescriptor transform Interface to identifier
            node = this.addInterfacePattern(node);
            return TS.visitEachChild(node, fileVisitor.visitor.bind(fileVisitor), fileVisitor.context);
        } else {

            // Add leading "/" to IOR import
            if (node.expression.kind === TS.SyntaxKind.ImportKeyword) {
                if (node.arguments.length === 1 && node.arguments[0].kind === TS.SyntaxKind.StringLiteral) {
                    let arg = node.arguments[0] as TS.StringLiteral;

                    if (arg.text.startsWith('ior:esm:')) {
                        this.context.componentDescriptor.addIORDependency(arg.text);
                        return TS.factory.updateCallExpression(node, node.expression, node.typeArguments, [TS.factory.createStringLiteral(`/${arg.text}`)]);
                    }
                }
            }

            return TS.visitEachChild(node, fileVisitor.visitor.bind(fileVisitor), fileVisitor.context);
        }
    }

    addInterfacePattern(node: TS.CallExpression): TS.CallExpression {
        if (node.typeArguments !== undefined && node.typeArguments.length === 1 && TS.isTypeReferenceNode(node.typeArguments[0]) &&
            ((node.expression as TS.PropertyAccessExpression)?.expression as TS.Identifier)?.text === 'InterfaceDescriptorHandler' &&
            (node.expression as TS.PropertyAccessExpression)?.name?.text.match(/^(getInterfaceDescriptor|isInterface)$/)) {

            let dd = new DeclarationDescriptor((node.typeArguments[0].typeName as TS.Identifier), this.context);
            return TS.factory.updateCallExpression(node, node.expression, node.typeArguments, [
                ...node.arguments,
                TS.factory.createArrayLiteralExpression(dd.packageAndLocation.map(x => TS.factory.createStringLiteral(x)))
            ]);
        }
        return node;
    }

}
