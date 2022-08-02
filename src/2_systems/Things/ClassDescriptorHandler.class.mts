// ##IGNORE_TRANSFORMER##
import DeclarationDescriptor from "../../1_infrastructure/Build/Typescript/Transformer/DeclarationDescriptor.class.mjs";
import ClassDescriptorInterface, { ClassDescriptorStatics } from "../../3_services/Thing/ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface from "../../3_services/Thing/InterfaceDescriptor.interface.mjs";
import ClassDescriptor from "./ClassDescriptor.class.mjs";

class ClassDescriptorHandlerClass implements ClassDescriptorStatics {
    getFileName(ClassName: string): string {
        return `${ClassName}.class.meta.json`
    }

    factory(declarationDescriptor: DeclarationDescriptor): ClassDescriptorInterface<any> {
        let existingInstance = ONCE.rootNamespace.search(declarationDescriptor.packageAndLocation);
        if (existingInstance && "implements" in existingInstance) return existingInstance;
        return new ClassDescriptor().init(declarationDescriptor);
    }
}


let ClassDescriptorHandler = new ClassDescriptorHandlerClass();
export default ClassDescriptorHandler;

