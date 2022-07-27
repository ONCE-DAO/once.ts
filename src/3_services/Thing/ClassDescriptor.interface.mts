import Class from "../Class.interface.mjs";
import InterfaceDescriptorInterface from "./InterfaceDescriptor.interface.mjs";
import Thing from "./Thing.interface.mjs";
import UcpComponentDescriptorInterface from "./UcpComponentDescriptor.interface.mjs";
export default interface ClassDescriptorInterface<ClassType extends Class<any>> {
    ucpComponentDescriptor: UcpComponentDescriptorInterface;
    componentExportName: string
    componentExport: 'defaultExport' | 'namedExport' | undefined;
    packagePath: string
    packageName: string
    packageVersion: string
    location: string | undefined
    get uniqueName(): string;
    name: string | undefined
    implements(interfaceObject: InterfaceDescriptorInterface): boolean
    packageFilename: string
    //TODO Change that to Component export path
    classPackageString: string
    extends: Class<any>[]
    class: ClassType;
    className: string;
    init(aClass: ClassType): ClassDescriptorInterface<ClassType>
    add(object: InterfaceDescriptorInterface | UcpComponentDescriptorInterface): ClassDescriptorInterface<ClassType>
    register(packagePath: string, packageName: string, packageVersion: string | undefined, location: string): void
    implementedInterfaces: InterfaceDescriptorInterface[];
    addInterfaces(packagePath: string, packageName: string, packageVersion: string | undefined, location: string, interfaceName: string): this
    _getImplementedInterfaces(input: InterfaceDescriptorInterface[]): InterfaceDescriptorInterface[];
    implementsInterface<CheckInterface extends Thing<any>>(object: Thing<any>): object is CheckInterface
}

export interface ClassDescriptorStatics extends Class<ClassDescriptorInterface<any>> {
    componentExport(exportType: 'defaultExport' | 'namedExport'): Function
    getClassDescriptor4Class<T extends Class<any>>(aClass: T): ClassDescriptorInterface<T>
    register(packagePath: string, packageName: string, packageVersion: string | undefined, location: string): Function
    addInterfaces(packagePath: string, packageName: string, packageVersion: string | undefined, location: string, interfaceName: string): Function
}