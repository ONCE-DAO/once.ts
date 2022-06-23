import NpmPackage from "../NpmPackage.interface.mjs";
import InterfaceDescriptorInterface from "./InterfaceDescriptor.interface.mjs";
import { ThingStatics } from "./Thing.interface.mjs";

export default interface UcpComponentDescriptorInterface {

    // TODO: specify better
    units: (ThingStatics<any> | InterfaceDescriptorInterface)[];
    npmPackage: NpmPackage;
    relativeSrcPath: string | undefined;
    identifier: string | undefined;

    get name(): string
    get version(): string
    get srcPath(): string
    defaultExportObject: ThingStatics<any> | InterfaceDescriptorInterface | undefined
    getUnitByName(name: string, type: 'InterfaceDescriptor' | 'ClassDescriptor'): any
    register(object: ThingStatics<any> | InterfaceDescriptorInterface): void

    initBasics(packagePath: string, packageName: string, packageVersion: string | undefined): UcpComponentDescriptorInterface
}

export interface UcpComponentDescriptorStatics {
    register(packagePath: string, packageName: string, packageVersion: string | undefined): Function
    getDescriptor(packagePath: string, packageName: string, packageVersion: string | undefined): UcpComponentDescriptorInterface
}

export type UcpComponentDescriptorDataStructure = {
    name: string;
    version: string;
    package: string;
}