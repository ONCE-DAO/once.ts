import DeclarationDescriptor from "../../1_infrastructure/Build/Typescript/Transformer/DeclarationDescriptor.class.mjs";
import Class from "../Class.interface.mjs";
import Exportable from "../Exportable.interface.mjs";
import IOR from "../IOR.interface.mjs";
import NamespaceInterface from "../Namespace/Namespace.interface.mjs";
import InterfaceDescriptorInterface from "./InterfaceDescriptor.interface.mjs";
import Thing from "./Thing.interface.mjs";
import UcpComponentDescriptorInterface from "./UcpComponentDescriptor.interface.mjs";
export default interface ClassDescriptorInterface<ClassType extends Class<any>> extends Exportable {
    ucpComponentDescriptor: UcpComponentDescriptorInterface;
    componentExportName: string
    componentExport: 'defaultExport' | 'namedExport';
    // packagePath: string
    // packageName: string
    // packageVersion: string
    location: string[]
    name: string
    implements(interfaceObject: InterfaceDescriptorInterface): boolean
    packageFilename: string
    //TODO Change that to Component export path
    classIOR: IOR
    extends: Class<any>[]
    class: ClassType;
    init(declarationDescriptor: DeclarationDescriptor): this
    add(object: InterfaceDescriptorInterface | UcpComponentDescriptorInterface): ClassDescriptorInterface<ClassType>
    implementedInterfaces: InterfaceDescriptorInterface[];
    _getImplementedInterfaces(input: InterfaceDescriptorInterface[]): InterfaceDescriptorInterface[];
    implementsInterface<CheckInterface extends Thing<any>>(object: Thing<any>): object is CheckInterface

    parent: NamespaceInterface
}

export interface ClassDescriptorFileFormat {
    name: string,
    //classIOR: string
    classFile: string,
    interfaces: string[],
    componentExport: 'defaultExport' | 'namedExport',
}

export interface ClassDescriptorStatics {
    getFileName(ClassName: string): string
}