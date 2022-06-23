import ClassDescriptorInterface from "./ClassDescriptor.interface.mjs";
import UcpComponentDescriptorInterface from "./UcpComponentDescriptor.interface.mjs";

export default interface InterfaceDescriptorInterface {
    ucpComponentDescriptor: UcpComponentDescriptorInterface;
    extends: InterfaceDescriptorInterface[];
    name: string;
    componentExport: 'namedExport' | 'defaultExport' | undefined;
    componentExportName: string;
    packagePath: string;
    packageName: string;
    packageVersion: string;
    allExtendedInterfaces: InterfaceDescriptorInterface[];
    implementedInterfaces: InterfaceDescriptorInterface[];

    addImplementation(classDescriptor: ClassDescriptorInterface): InterfaceDescriptorInterface;

    addExtension(packagePath: string, packageName: string, packageVersion: string | undefined, interfaceName: string): InterfaceDescriptorInterface;
    add(object: InterfaceDescriptorInterface | UcpComponentDescriptorInterface): InterfaceDescriptorInterface;
    _getImplementedInterfaces(input: InterfaceDescriptorInterface[]): InterfaceDescriptorInterface[];

}
