import DeclarationDescriptor from "../../1_infrastructure/Build/Typescript/Transformer/DeclarationDescriptor.class.mjs";
import Class from "../Class.interface.mjs";
import Exportable from "../Exportable.interface.mjs";
import { NamespaceParent } from "../Namespace/Namespace.interface.mjs";
import ClassDescriptorInterface from "./ClassDescriptor.interface.mjs";
import Thing from "./Thing.interface.mjs";
import UcpComponentDescriptorInterface from "./UcpComponentDescriptor.interface.mjs";

export default interface InterfaceDescriptorInterface extends Exportable {
    parent: NamespaceParent | undefined;

    ucpComponentDescriptor: UcpComponentDescriptorInterface;
    extends: InterfaceDescriptorInterface[];
    name: string;
    location: string[];
    componentExport: 'namedExport' | 'defaultExport' | undefined;
    componentExportName: string;
    packagePath: string;
    packageName: string;
    packageVersion: string;
    allExtendedInterfaces: InterfaceDescriptorInterface[];
    implementedInterfaces: InterfaceDescriptorInterface[];
    addImplementation(classDescriptor: ClassDescriptorInterface<any>): InterfaceDescriptorInterface;
    add(object: InterfaceDescriptorInterface | UcpComponentDescriptorInterface): InterfaceDescriptorInterface;
    _getImplementedInterfaces(input: InterfaceDescriptorInterface[]): InterfaceDescriptorInterface[];
    implementations: Class<any>[];
    init(declarationDescriptor: DeclarationDescriptor): this
}

export interface InterfaceDescriptorStatics {
    getInterfaceDescriptor<Interface>(): InterfaceDescriptorInterface
    getInterfaceDescriptor<Interface extends Thing<any>>(location?: string[]): InterfaceDescriptorInterface | undefined
    isInterface<Interface extends Thing<any>>(object: Thing<any>): object is Interface
    getFileName(interfaceName: string): string
    factory(declarationDescriptor: DeclarationDescriptor): InterfaceDescriptorInterface
}

export interface InterfaceDescriptorFileFormat {
    name: string,
    // classIOR: string
    extends: string[],
    // componentExport: 'defaultExport' | 'namedExport',
}