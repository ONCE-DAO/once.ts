import DeclarationDescriptor from "../../1_infrastructure/Build/Typescript/Transformer/DeclarationDescriptor.class.mjs";
import Class from "../Class.interface.mjs";
import IOR from "../IOR.interface.mjs";
import NamespaceInterface, { NamespaceChild, NamespaceObjectTypeName } from "../Namespace/Namespace.interface.mjs";
import FileUcpUnit from "../UCP/FileUcpUnit.interface.mjs";
import InterfaceDescriptorInterface from "./InterfaceDescriptor.interface.mjs";
import Thing from "./Thing.interface.mjs";
import UcpComponentDescriptorInterface from "./UcpComponentDescriptor.interface.mjs";
export default interface ClassDescriptorInterface extends NamespaceChild {
    objectType: NamespaceObjectTypeName.ClassDescriptor;
    componentExportName: string
    componentExport: 'defaultExport' | 'namedExport' | 'noExport';
    fileExport: 'defaultExport' | 'namedExport' | 'noExport';
    ucpComponentDescriptor: UcpComponentDescriptorInterface

    fileUnit: FileUcpUnit;
    location: string[]
    name: string
    implements(interfaceObject: InterfaceDescriptorInterface): boolean
    classIOR: IOR
    extends: (ClassDescriptorInterface | undefined)
    getClass(): Promise<Class<any>>;
    init(declarationDescriptor: DeclarationDescriptor): this
    add(object: InterfaceDescriptorInterface): ClassDescriptorInterface
    implementedInterfaces: InterfaceDescriptorInterface[];
    _getImplementedInterfaces(input: InterfaceDescriptorInterface[]): InterfaceDescriptorInterface[];
    implementsInterface<CheckInterface extends Thing<any>>(object: Thing<any>): object is CheckInterface

    /** 
     * register itself to all Interfaces as Implementation 
     */
    registerAllInterfaces(): void;
    parent: NamespaceInterface
}

export interface ClassDescriptorFileFormat {
    name: string,
    //classIOR: string
    fileUnit: string,
    interfaces: string[],
    extends: string | undefined
    componentExport: 'defaultExport' | 'namedExport' | 'noExport',
    fileExport: 'defaultExport' | 'namedExport' | 'noExport'
}

export interface ClassDescriptorStatics {
    getFileName(ClassName: string): string
}