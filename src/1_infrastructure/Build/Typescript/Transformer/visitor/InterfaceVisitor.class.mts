// ##IGNORE_TRANSFORMER##

import path from "path";
import TS from 'typescript';
import DeclarationDescriptor from '../DeclarationDescriptor.class.mjs';
import { TSNodeVisitor } from '../Transformer.interface.mjs';
import { debug, localInterfaceDescriptorPath } from '../Transformer.mjs';
import BaseVisitor from './BaseVisitor.class.mjs';

export default class InterfaceVisitor extends BaseVisitor implements TSNodeVisitor {

    static get validTSSyntaxKind(): TS.SyntaxKind {
        return TS.SyntaxKind.InterfaceDeclaration;
    }

    static {
        BaseVisitor.implementations.push(this);

    }

    visit(node: TS.InterfaceDeclaration): TS.VisitResult<TS.Node> {
        if (this.context.fileVisitor.phase === "after")
            return node;

        let fileVisitor = this.context.fileVisitor;

        let dd = new DeclarationDescriptor(node.name, this.context);

        let id = dd.interfaceDescriptorFactory();



        // this.addImportInterfaceDescriptor();
        // const exportVariableStatement = this.getInterfaceDescriptorRegister(node);

        //if (debug) console.log(node);
        return TS.visitEachChild(node, fileVisitor.visitor.bind(fileVisitor), fileVisitor.context);

        // return [exportVariableStatement, newNode];
    }


    private checkHeritageClause(tsClass: TS.InterfaceDeclaration, innerCallExpression: TS.CallExpression): TS.CallExpression {
        let returnCallExpression: TS.CallExpression = innerCallExpression;

        if (debug)
            console.log("interface: checkHeritageClause");
        if (tsClass.heritageClauses) {
            if (debug)
                console.log("interface: has heritageClauses");

            tsClass.heritageClauses.forEach(element => {
                //if (debug) console.log("element:", element)
                element.types.forEach((type: TS.ExpressionWithTypeArguments) => {

                    const identifier = type.expression as TS.Identifier;
                    if (debug)
                        console.log("  Extends  Interface:", identifier.text);

                    returnCallExpression = this.addExtendDeceleration(identifier, returnCallExpression);

                });
            });
        }
        return returnCallExpression;
    }



    private _getUpperImportDeclaration(object: TS.Node | undefined): TS.ImportDeclaration | undefined {
        if (object === undefined) {
            return undefined;
        } else if (TS.isImportDeclaration(object)) {
            return object;
        } else if ("parent" in object) {
            return this._getUpperImportDeclaration(object.parent);
        } else {
            throw new Error("Not implemented yet 5");

        }
    }

    addExtendDeceleration(identifier: TS.Identifier, innerCallExpression: TS.CallExpression): TS.CallExpression {

        let descriptor = new DeclarationDescriptor(identifier, this.context);

        return TS.factory.createCallExpression(
            TS.factory.createPropertyAccessExpression(
                innerCallExpression,
                TS.factory.createIdentifier("addExtension")
            ),
            undefined,
            [
                TS.factory.createStringLiteral(descriptor.componentDescriptor.package),
                TS.factory.createStringLiteral(descriptor.componentDescriptor.name),
                TS.factory.createStringLiteral(descriptor.componentDescriptor.version),
                TS.factory.createStringLiteral(descriptor.location),
                TS.factory.createStringLiteral(descriptor.name)
            ]
        );
    }

    private getInterfaceDescriptorRegister(node: TS.InterfaceDeclaration) {
        // let interfaceName = node.name.text;//+ "InterfaceDescriptor";
        //let newNode = ts.createSourceFile(interfaceName+"interface.ts","empty file", ts.ScriptTarget.ES5, true ,ts.ScriptKind.TS);
        const cd = TS.factory.createIdentifier('InterfaceDescriptor');

        let declarationDescriptor = new DeclarationDescriptor(node.name, this.context);
        //let componentDescriptor = this.componentDescriptor;
        let call = TS.factory.createCallExpression(
            TS.factory.createPropertyAccessExpression(
                cd, "register"),
            undefined,
            [
                TS.factory.createStringLiteral(declarationDescriptor.componentDescriptor.package),
                TS.factory.createStringLiteral(declarationDescriptor.componentDescriptor.name),
                TS.factory.createStringLiteral(declarationDescriptor.componentDescriptor.version),
                TS.factory.createStringLiteral(declarationDescriptor.location),
                TS.factory.createStringLiteral(declarationDescriptor.name)
            ]
        );

        // Check for extends
        call = this.checkHeritageClause(node, call);

        return call;
    }

    private addImportInterfaceDescriptor() {
        let importNode: TS.ImportDeclaration;

        if (this.context.fileVisitor.isOnceFile) {
            const dir = path.dirname(this.context.sourceFile.fileName);
            let onceModulePath = dir.replace(/^(.*\/[oO]nce@[^\/]+\/src\/).*/, '$1');
            let relativePath = path.relative(dir, path.join(onceModulePath, localInterfaceDescriptorPath)) || ".";
            if (!relativePath.startsWith('.'))
                relativePath = './' + relativePath;

            importNode = this.createDefaultImportNode("InterfaceDescriptor", relativePath);
        } else {
            let onceIOR = this.context.program.getCompilerOptions().onceIOR;
            if (typeof onceIOR != "string")
                throw new Error("Missing onceIOR in the CompilerOptions");
            importNode = this.createNamedImportNode("InterfaceDescriptor", onceIOR);

        }

        this.context.fileVisitor.add2Header(`InterfaceDescriptor`, importNode);
    }
}
