// ##IGNORE_TRANSFORMER##

import ComponentDescriptorTR from "./ComponentDescriptor.class.mjs";
import TS from 'typescript';
import FileVisitor from "./visitor/FileVisitor.class.mjs";

export interface TSNodeVisitor {
    context: VisitorContext
    componentDescriptor: ComponentDescriptorTR;
    visit(node: TS.Node): TS.VisitResult<TS.Node>
    test?(node: TS.Node): boolean
    lift?(node: readonly TS.Node[]): TS.Node
}

export type exportType = 'TypescriptClass' | 'TypescriptInterface' | 'TypescriptType' | 'TypescriptEnum' | "unknown"


export type VisitorContext = {
    //  checker: ts.TypeChecker
    transformationContext: TS.TransformationContext
    program: TS.Program
    sourceFile: TS.SourceFile,
    fileVisitor: FileVisitor,
    componentDescriptor: ComponentDescriptorTR;
};