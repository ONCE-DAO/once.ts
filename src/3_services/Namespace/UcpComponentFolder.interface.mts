import NamespaceInterface, { NamespaceObjectTypeName } from "./Namespace.interface.mjs";
import VersionFolder from "./VersionFolder.interface.mjs";

export default interface UcpComponentFolder extends NamespaceInterface {
    objectType: NamespaceObjectTypeName.UcpComponentFolder
    package: string
    children: (UcpComponentFolder | VersionFolder)[];
    parent: NamespaceInterface | UcpComponentFolder
}