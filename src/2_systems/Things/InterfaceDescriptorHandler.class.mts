import DeclarationDescriptor from "../../1_infrastructure/Build/Typescript/Transformer/DeclarationDescriptor.class.mjs";
import InterfaceDescriptorInterface, { InterfaceDescriptorStatics } from "../../3_services/Thing/InterfaceDescriptor.interface.mjs";
import Thing from "../../3_services/Thing/Thing.interface.mjs";
import InterfaceDescriptor from "./InterfaceDescriptor.class.mjs";

class InterfaceDescriptorHandlerClass implements InterfaceDescriptorStatics {

    private _getInterfaceDescriptor(location: string[]): InterfaceDescriptorInterface | undefined {
        let l = [...location];
        // l.push(this.getFileName(l.pop() as string));

        let result = ONCE.rootNamespace.search(l);
        if (result && "getImplementations" in result) return result;
    }

    getInterfaceDescriptor<Interface extends Thing<any>>(location?: string[]): InterfaceDescriptorInterface {
        if (location === undefined || location.length === 0) throw new Error("Missing location");
        let result = this._getInterfaceDescriptor(location);
        if (result) return result;
        throw new Error("Can not find interface " + location.join("."));
    }

    isInterface<InterfaceImplementation extends Thing<any>>(object: Thing<any>, location?: string[]): object is InterfaceImplementation {
        if (location === undefined || location.length === 0) throw new Error("Missing location");

        let interfaceDescriptor = this.getInterfaceDescriptor(location);
        return object.classDescriptor.implements(interfaceDescriptor)
    }

    getFileName(interfaceName: string): string {
        return interfaceName + '.interface.meta.json';
    }

    factory(declarationDescriptor: DeclarationDescriptor): InterfaceDescriptorInterface {
        let existingInstance = ONCE.rootNamespace.search(declarationDescriptor.packageAndLocation);
        if (existingInstance && "getImplementations" in existingInstance) return existingInstance;
        return new InterfaceDescriptor().init(declarationDescriptor)
    }


}

const InterfaceDescriptorHandler = new InterfaceDescriptorHandlerClass() as InterfaceDescriptorStatics;
export default InterfaceDescriptorHandler;