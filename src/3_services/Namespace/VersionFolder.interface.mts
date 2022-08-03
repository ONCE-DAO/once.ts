import ClassDescriptorInterface from "../Thing/ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface from "../Thing/InterfaceDescriptor.interface.mjs";
import UcpComponentDescriptorInterface from "../Thing/UcpComponentDescriptor.interface.mjs";
import LayerFolder from "./LayerFolder.mjs";
import NamespaceInterface, { NamespaceObjectTypeName } from "./Namespace.interface.mjs";
import UcpComponentFolder from "./UcpComponentFolder.interface.mjs";

export default interface VersionFolder extends NamespaceInterface {
    objectType: NamespaceObjectTypeName.VersionFolder
    version: string;
    children: (NamespaceInterface | ClassDescriptorInterface | UcpComponentDescriptorInterface | InterfaceDescriptorInterface | LayerFolder)[];
    parent: UcpComponentFolder
    ucpComponentDescriptor: UcpComponentDescriptorInterface
    package: string
}