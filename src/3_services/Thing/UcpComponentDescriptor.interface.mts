import Exportable from "../Exportable.interface.mjs";
import { NamespaceObjectTypeName, NamespaceParent } from "../Namespace/Namespace.interface.mjs";
import VersionFolder from "../Namespace/VersionFolder.interface.mjs";
import UcpUnit from "../UCP/UcpUnit.interface.mjs";
import ClassDescriptorInterface from "./ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface from "./InterfaceDescriptor.interface.mjs";

export default interface UcpComponentDescriptorInterface extends Exportable {
    name: string

    objectType: NamespaceObjectTypeName.UcpComponentDescriptor
    parent: NamespaceParent;
    version: VersionFolder
    package: string;
    location: string[];

    units: (ClassDescriptorInterface | InterfaceDescriptorInterface)[];

    init(name: string): this
}

export interface ServerSideUcpComponentDescriptorInterface extends UcpComponentDescriptorInterface {
    get scenarioDirectory(): string;
    writeToPath(writePath: string): void;
    get defaultExportObject(): ClassDescriptorInterface | InterfaceDescriptorInterface | undefined
}

export interface UcpComponentDescriptorStatics {
    // register(packagePath: string, packageName: string, packageVersion: string | undefined): Function
    // getDescriptor(packagePath: string, packageName: string, packageVersion: string | undefined): UcpComponentDescriptorInterface;
    // getDescriptorName(packagePath: string, packageName: string, packageVersion: string | undefined): string
    // registerDescriptor(object: UcpComponentDescriptorInterface, packagePath: string, packageName: string, packageVersion: string | undefined): void
}

export type UcpComponentDescriptorDataStructure = {
    name: string;
    version: string;
    package: string;
}


export interface UcpComponentDescriptorFileFormat {
    name: string,
}