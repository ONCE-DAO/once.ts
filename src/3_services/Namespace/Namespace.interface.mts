import Exportable from "../Exportable.interface.mjs";
import Folder from "../File/Folder.interface.mjs";
import IOR from "../IOR.interface.mjs";
import ClassDescriptorInterface from "../Thing/ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface from "../Thing/InterfaceDescriptor.interface.mjs";
import UcpComponentDescriptorInterface from "../Thing/UcpComponentDescriptor.interface.mjs";
import FileUcpUnit from "../UCP/FileUcpUnit.interface.mjs";
import LayerFolder from "./LayerFolder.mjs";
import UcpComponentFolder from "./UcpComponentFolder.interface.mjs";
import VersionFolder from "./VersionFolder.interface.mjs";

export type NamespaceChildren = NamespaceInterface | ClassDescriptorInterface | UcpComponentDescriptorInterface | InterfaceDescriptorInterface | UcpComponentFolder | VersionFolder | FileUcpUnit
export type NamespaceParent = NamespaceInterface | VersionFolder;

export type NamespaceBrowsable = { [index: string]: NamespaceChildren | NamespaceBrowsable }

export default interface NamespaceInterface extends Folder, NamespaceChild {
    children: NamespaceChildren[];
    browsable: NamespaceBrowsable

    /**
     * Get Child with a specific name on this Object
     * @param name 
     */
    getChildByName(name: string): NamespaceChildren | undefined
    /**
     * Get all loaded recursive children of a specific type
     * @param types 
     */
    recursiveChildren(types?: NamespaceObjectTypeName[]): NamespaceChildren[]

    add(object: NamespaceChildren, location: string[], checkOverwrite?: boolean): void

    search(packageString: string): NamespaceChildren | undefined
    search(ior: IOR): NamespaceChildren | undefined
    search(location: string[]): NamespaceChildren | undefined
    discover(name?: string, options?: { recursive?: boolean, level?: number }): Promise<NamespaceChildren[]>

    getParentType(typeName: NamespaceObjectTypeName.VersionFolder): VersionFolder | undefined
    getParentType(typeName: NamespaceObjectTypeName.LayerFolder): LayerFolder | undefined
    getParentType(typeName: NamespaceObjectTypeName.Namespace): NamespaceInterface | undefined
    getParentType(typeName: NamespaceObjectTypeName.UcpComponentFolder): UcpComponentFolder | undefined

}

export interface NamespaceChild extends Exportable {
    objectType: NamespaceObjectTypeName
    name: string;
    parent: NamespaceParent
    package: string
    location: string[]
    IOR: IOR
    relativeComponentLocation(location?: string[]): string[] | undefined
}

export interface NamespaceFileFormat {
    name: string,
}

export enum NamespaceObjectTypeName {
    "Namespace" = "Namespace",
    "ClassDescriptor" = "ClassDescriptorInterface",
    "UcpComponentDescriptor" = "UcpComponentDescriptorInterface",
    "InterfaceDescriptor" = "InterfaceDescriptorInterface",
    "UcpComponentFolder" = "UcpComponentFolder",
    "VersionFolder" = "VersionFolder",
    "LayerFolder" = "LayerFolder",
    "FileUcpUnit" = "FileUcpUnit"
}