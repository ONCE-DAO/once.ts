import Class from "../Class.interface.mjs";
import NpmPackage from "../NpmPackage.interface.mjs";
import ClassDescriptorInterface from "./ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface from "./InterfaceDescriptor.interface.mjs";

export default interface UcpComponentDescriptorInterface {

    // TODO: specify better
    units: (ClassDescriptorInterface<Class<any>> | InterfaceDescriptorInterface)[];
    npmPackage: NpmPackage;
    relativeSrcPath: string | undefined;
    identifier: string | undefined;

    get name(): string
    get version(): string
    get srcPath(): string
    defaultExportObject: ClassDescriptorInterface<Class<any>> | InterfaceDescriptorInterface | undefined

    getUnitByName(name: string, type: 'ClassDescriptor'): ClassDescriptorInterface<Class<any>> | undefined;
    getUnitByName(name: string, type: 'InterfaceDescriptor'): InterfaceDescriptorInterface | undefined;

    register(object: InterfaceDescriptorInterface | ClassDescriptorInterface<Class<any>>): void

    initBasics(packagePath: string, packageName: string, packageVersion: string | undefined): UcpComponentDescriptorInterface
}

export interface ServerSideUcpComponentDescriptorInterface extends UcpComponentDescriptorInterface {
    get scenarioDirectory(): string;
    writeToPath(writePath: string): void;
    get defaultExportObject(): ClassDescriptorInterface<Class<any>> | InterfaceDescriptorInterface | undefined
}

export interface UcpComponentDescriptorStatics {
    register(packagePath: string, packageName: string, packageVersion: string | undefined): Function
    getDescriptor(packagePath: string, packageName: string, packageVersion: string | undefined): UcpComponentDescriptorInterface;
    getDescriptorName(packagePath: string, packageName: string, packageVersion: string | undefined): string
    registerDescriptor(object: UcpComponentDescriptorInterface, packagePath: string, packageName: string, packageVersion: string | undefined): void
}

export type UcpComponentDescriptorDataStructure = {
    name: string;
    version: string;
    package: string;
}