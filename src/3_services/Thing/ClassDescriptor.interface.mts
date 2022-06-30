import Class from "./Class.interface.mjs";
import InterfaceDescriptorInterface from "./InterfaceDescriptor.interface.mjs";
import UcpComponentDescriptorInterface from "./UcpComponentDescriptor.interface.mjs";
export default interface ClassDescriptorInterface {
    ucpComponentDescriptor: UcpComponentDescriptorInterface;
    filename: string | undefined;
    componentExportName: string
    componentExport: 'defaultExport' | 'namedExport' | undefined;
    packagePath: string
    packageName: string
    packageVersion: string
    name: string | undefined
    implements(interfaceObject: InterfaceDescriptorInterface): boolean
    packageFilename: string
    //TODO Change that to Component export path
    classPackageString: string
    extends: Class<any>[]
    class: any;
    className: string;
    init(aClass: Class<any>): this
    add(object: InterfaceDescriptorInterface | UcpComponentDescriptorInterface): ClassDescriptorInterface
    register(packagePath: string, packageName: string, packageVersion: string | undefined): void
    implementedInterfaces: InterfaceDescriptorInterface[];
    addInterfaces(packagePath: string, packageName: string, packageVersion: string | undefined, interfaceName: string): this
    setFilePath(filename: string): void
    _getImplementedInterfaces(input: InterfaceDescriptorInterface[]): InterfaceDescriptorInterface[];
}

export interface ClassDescriptorStatics extends Class<ClassDescriptorInterface> {
    componentExport(exportType: 'defaultExport' | 'namedExport'): Function
    getClassDescriptor4Class(aClass: Class<any>): ClassDescriptorInterface
    setFilePath(filename: string): Function
    register(packagePath: string, packageName: string, packageVersion: string | undefined): Function
    addInterfaces(packagePath: string, packageName: string, packageVersion: string | undefined, interfaceName: string): Function
}