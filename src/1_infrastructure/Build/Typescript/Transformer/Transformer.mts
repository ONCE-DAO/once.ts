import TS from 'typescript';
import FileVisitor from './visitor/FileVisitor.class.mjs';

export const debug: boolean = false;
export const jsExtension: boolean = false;
export const localInterfaceDescriptorPath: string = '2_systems/Things/InterfaceDescriptor.class.mjs'
export const localClassDescriptorPath: string = '2_systems/Things/ClassDescriptor.class.mjs'


// Direct interface for the Compiler
export function transformerFactory(program: TS.Program, run: "before" | "after"): TS.TransformerFactory<TS.SourceFile> {

  return (context: TS.TransformationContext) => (sourceFile: TS.SourceFile) => {
    return new FileVisitor(sourceFile).init(context, run, program).transform();
  }
}
