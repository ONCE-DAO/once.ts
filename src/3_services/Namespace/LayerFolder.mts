import ClassDescriptorInterface from "../Thing/ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface from "../Thing/InterfaceDescriptor.interface.mjs";
import UcpComponentDescriptorInterface from "../Thing/UcpComponentDescriptor.interface.mjs";
import NamespaceInterface, { NamespaceObjectTypeName } from "./Namespace.interface.mjs";
import VersionFolder from "./VersionFolder.interface.mjs";

export default interface LayerFolder extends NamespaceInterface {
    objectType: NamespaceObjectTypeName.LayerFolder
    layer: number;
    children: (NamespaceInterface | ClassDescriptorInterface<any> | UcpComponentDescriptorInterface | InterfaceDescriptorInterface)[];
    parent: VersionFolder
}