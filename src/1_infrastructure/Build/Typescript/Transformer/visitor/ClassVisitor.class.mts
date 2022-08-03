// ##IGNORE_TRANSFORMER##

import path from "path";
import ts from "typescript";
import ClassDescriptorHandler from "../../../../../2_systems/Things/ClassDescriptorHandler.class.mjs";
import ClassDescriptorInterface from "../../../../../3_services/Thing/ClassDescriptor.interface.mjs";
import DeclarationDescriptor from '../DeclarationDescriptor.class.mjs';
import { TSNodeVisitor } from '../Transformer.interface.mjs';
import { debug, localClassDescriptorPath } from '../Transformer.mjs';
import BaseVisitor from './BaseVisitor.class.mjs';

export default class ClassVisitor extends BaseVisitor implements TSNodeVisitor {

    static get validTSSyntaxKind(): ts.SyntaxKind {
        return ts.SyntaxKind.ClassDeclaration;
    }

    static {
        BaseVisitor.implementations.push(this);

    }


    visit(node: ts.ClassDeclaration): ts.VisitResult<ts.Node> {
        if (this.context.fileVisitor.phase === "after")
            return node;

        // this.addImportClassDescriptor();
        const fileVisitor = this.context.fileVisitor;

        if (debug)
            console.log("Class: " + node.name?.escapedText);

        if (!node.name) throw new Error("Only classes with Names are Supported! " + this.context.fileVisitor.sourceFile.fileName);

        // Create ClassDescriptor
        let dd = new DeclarationDescriptor(node.name, this.context);
        let cd = dd.classDescriptorFactory();
        if (!cd) throw new Error("Fail to get ClassDescriptor")
        // let cd = ClassDescriptorHandler.factory(dd);

        // if (this.context.sourceFile.fileName.match("ClassDescriptor") || this.context.sourceFile.fileName.match("NpmPackage") || this.context.sourceFile.fileName.match("UcpComponentDescriptor") || this.context.sourceFile.fileName.match("OnceZod")) {
        //   if (debug) console.log("Cancel ClassDescriptor");
        //   return ts.visitEachChild(node, fileVisitor.visitor.bind(fileVisitor), fileVisitor.context);
        // }
        this.checkHeritageClause(node, cd);
        node = this.addClassDescriptorLink(node);
        //descriptor.push(this.getDecoratorFilename());
        // descriptor.push(this.getDecoratorRegister(node));

        // node = ts.factory.updateClassDeclaration(
        //     node,
        //     descriptor,
        //     node.modifiers,
        //     node.name,
        //     node.typeParameters,
        //     node.heritageClauses,
        //     node.members
        // );


        return ts.visitEachChild(node, fileVisitor.visitor.bind(fileVisitor), fileVisitor.context);

    }

    getDecoratorRegister(node: ts.ClassDeclaration): ts.Decorator {
        if (!node.name)
            throw new Error("Missing Class name");
        const declarationDescriptor = new DeclarationDescriptor(node.name, this.context);

        return this.descriptorCreator(["ClassDescriptor", "register"],
            [declarationDescriptor.componentDescriptor.package,
            declarationDescriptor.componentDescriptor.name,
            declarationDescriptor.componentDescriptor.version,
            declarationDescriptor.location]);
    }


    addClassDescriptorLink(node: ts.ClassDeclaration): ts.ClassDeclaration {
        if (!node.name) return node;
        let dd = new DeclarationDescriptor(node.name, this.context);
        let getter = this.createOnceNamespaceSearch(dd, false);
        let getterStatic = this.createOnceNamespaceSearch(dd, true);

        node = ts.factory.updateClassDeclaration(node, node.decorators, node.modifiers, node.name, node.typeParameters, node.heritageClauses, [...node.members, getter, getterStatic])
        return node;
    }

    createOnceNamespaceSearch(dd: DeclarationDescriptor, staticType: boolean) {
        return ts.factory.createGetAccessorDeclaration(
            undefined,
            staticType === true ? [ts.factory.createModifier(ts.SyntaxKind.StaticKeyword)] : undefined,
            ts.factory.createIdentifier("classDescriptor"),
            [],
            undefined,
            ts.factory.createBlock(
                [ts.factory.createReturnStatement(ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("ONCE"),
                            ts.factory.createIdentifier("rootNamespace")
                        ),
                        ts.factory.createIdentifier("search")
                    ),
                    undefined,
                    [ts.factory.createArrayLiteralExpression(
                        dd.packageAndLocation.map(x => ts.factory.createStringLiteral(x)),
                        false
                    )]
                ))],
                true
            )
        )
    }


    private _getUpperImportDeclaration(object: ts.Node | undefined): ts.ImportDeclaration | undefined {
        if (object === undefined) {
            return undefined;
        } else if (ts.isImportDeclaration(object)) {
            return object;
        } else if ("parent" in object) {
            return this._getUpperImportDeclaration(object.parent);
        } else {
            throw new Error("Not implemented yet 5");

        }
    }

    getDecoratorInterface(identifier: ts.Identifier): ts.Decorator | undefined {

        let declarationDescriptor = new DeclarationDescriptor(identifier, this.context);
        return this.descriptorCreator(["ClassDescriptor", "addInterfaces"],
            [declarationDescriptor.componentDescriptor.package,
            declarationDescriptor.componentDescriptor.name,
            declarationDescriptor.componentDescriptor.version,
            declarationDescriptor.location,
            declarationDescriptor.name]);

    }

    private descriptorCreator(propertyAccessExpression: string[], stringLiteral: (string | ts.Identifier | ts.ExpressionStatement)[]) {

        return ts.factory.createDecorator(ts.factory.createCallExpression(
            this.nodeIdentifier(propertyAccessExpression),
            undefined,
            stringLiteral.map(s => {
                if (typeof s === 'string') {
                    return ts.factory.createStringLiteral(s) as ts.Expression;
                } else {
                    return s as ts.Expression;
                }
            })

        ));
    }

    private checkHeritageClause(tsClass: ts.ClassDeclaration, classDescriptor: ClassDescriptorInterface): void {
        if (!tsClass.heritageClauses) return;
        for (const element of tsClass.heritageClauses) {
            if (element.token === ts.SyntaxKind.ExtendsKeyword) continue;
            for (const type of element.types) {
                const identifier = type.expression as ts.Identifier;
                let dd = new DeclarationDescriptor(identifier, this.context);
                let id = dd.interfaceDescriptorFactory();

                // TODO create a Warning if undefined
                if (id) classDescriptor.add(id);

            }
        }
    }


    private nodeIdentifier(propertyAccessExpression: string[]): ts.Identifier | ts.PropertyAccessExpression {
        if (propertyAccessExpression.length === 1) {
            return ts.factory.createIdentifier(propertyAccessExpression[0]);
        } else {
            let expression = this.nodeIdentifier(propertyAccessExpression.splice(0, propertyAccessExpression.length - 1));
            let name = this.nodeIdentifier(propertyAccessExpression.splice(0, 1)) as ts.Identifier;
            return ts.factory.createPropertyAccessExpression(expression, name);
        }
    }



    private addImportClassDescriptor() {

        let importNode: ts.ImportDeclaration;

        if (this.context.fileVisitor.isOnceFile) {
            const dir = path.dirname(this.context.sourceFile.fileName);
            let onceModulePath = dir.replace(/^(.*\/[oO]nce@[^\/]+\/src\/).*/, '$1');
            let relativePath = path.relative(dir, path.join(onceModulePath, localClassDescriptorPath)) || ".";
            if (!relativePath.startsWith('.'))
                relativePath = './' + relativePath;

            importNode = this.createDefaultImportNode("ClassDescriptor", relativePath);
        } else {
            let onceIOR = this.context.program.getCompilerOptions().onceIOR;
            if (typeof onceIOR != "string")
                throw new Error("Missing onceIOR in the CompilerOptions");

            importNode = this.createNamedImportNode("ClassDescriptor", onceIOR);
        }

        this.context.fileVisitor.add2Header(`ClassDescriptor`, importNode);
    }
}
