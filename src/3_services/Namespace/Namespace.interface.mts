import Folder from "../File/Folder.interface.mjs";
import IOR from "../IOR.interface.mjs";
import ClassDescriptorInterface from "../Thing/ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface from "../Thing/InterfaceDescriptor.interface.mjs";
import UcpComponentDescriptorInterface from "../Thing/UcpComponentDescriptor.interface.mjs";
import LayerFolder from "./LayerFolder.mjs";
import UcpComponentFolder from "./UcpComponentFolder.interface.mjs";
import VersionFolder from "./VersionFolder.interface.mjs";

export type NamespaceChildren = NamespaceInterface | ClassDescriptorInterface<any> | UcpComponentDescriptorInterface | InterfaceDescriptorInterface | UcpComponentFolder | VersionFolder
export type NamespaceParent = NamespaceInterface | VersionFolder;

export type NamespaceBrowsable = { [index: string]: NamespaceChildren | NamespaceBrowsable }

export default interface NamespaceInterface extends Folder {
    objectType: NamespaceObjectTypeName
    name: string;
    parent: NamespaceParent
    children: NamespaceChildren[];

    getChildByName(name: string): NamespaceChildren | undefined
    add(object: NamespaceChildren, location: string[]): void
    browsable: NamespaceBrowsable
    search(ior: IOR): NamespaceChildren | undefined
    search(location: string[]): NamespaceChildren | undefined
    getAllLoadedChildren: NamespaceChildren[]
    get location(): string[]
    getParentInstanceType(instanceTypeName: NamespaceObjectTypeName): NamespaceChildren | undefined

    discover(name?: string, options?: { recursive?: boolean, level?: number }): Promise<NamespaceChildren[]>

    getParentType(typeName: 'VersionFolder'): VersionFolder | undefined
    getParentType(typeName: 'LayerFolder'): LayerFolder | undefined
    getParentType(typeName: 'UcpComponentFolder'): UcpComponentFolder | undefined
    getParentType(typeName: 'Namespace'): NamespaceInterface | undefined

}



export interface NamespaceFileFormat {
    name: string,
}

export enum NamespaceObjectTypeName {
    "NamespaceInterface" = "NamespaceInterface",
    "ClassDescriptorInterface" = "ClassDescriptorInterface",
    "UcpComponentDescriptorInterface" = "UcpComponentDescriptorInterface",
    "InterfaceDescriptorInterface" = "InterfaceDescriptorInterface",
    "UcpComponentFolder" = "UcpComponentFolder",
    "VersionFolder" = "VersionFolder",
    "LayerFolder" = "LayerFolder",
}