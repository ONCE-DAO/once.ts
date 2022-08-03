import DeclarationDescriptor from "../../1_infrastructure/Build/Typescript/Transformer/DeclarationDescriptor.class.mjs";
import Class from "../Class.interface.mjs";
import Exportable from "../Exportable.interface.mjs";
import { NamespaceChild, NamespaceObjectTypeName, NamespaceParent } from "../Namespace/Namespace.interface.mjs";
import VersionFolder from "../Namespace/VersionFolder.interface.mjs";
import FileUcpUnit from "../UCP/FileUcpUnit.interface.mjs";
import UcpUnit from "../UCP/UcpUnit.interface.mjs";
import ClassDescriptorInterface from "./ClassDescriptor.interface.mjs";
import Thing from "./Thing.interface.mjs";
import UcpComponentDescriptorInterface from "./UcpComponentDescriptor.interface.mjs";

export default interface InterfaceDescriptorInterface extends NamespaceChild, UcpUnit {
    objectType: NamespaceObjectTypeName.InterfaceDescriptor
    fileUnit: FileUcpUnit
    ucpComponentDescriptor: UcpComponentDescriptorInterface;
    extends: InterfaceDescriptorInterface[];
    componentExport: 'namedExport' | 'defaultExport' | 'noExport';
    fileExport: 'defaultExport' | 'namedExport' | 'noExport';
    version: VersionFolder

    allExtendedInterfaces: InterfaceDescriptorInterface[];
    implementedInterfaces: InterfaceDescriptorInterface[];
    addImplementation(classDescriptor: ClassDescriptorInterface): InterfaceDescriptorInterface;
    add(object: InterfaceDescriptorInterface | UcpComponentDescriptorInterface): InterfaceDescriptorInterface;
    _getImplementedInterfaces(input: InterfaceDescriptorInterface[]): InterfaceDescriptorInterface[];
    getImplementations(): Promise<Class<any>[]>;
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
    fileUnit: string
    fileExport: 'defaultExport' | 'namedExport' | 'noExport';
    // classIOR: string
    extends: string[],
    componentExport: 'defaultExport' | 'namedExport' | 'noExport',
}