import Exportable from "../Exportable.interface.mjs"
import IOR from "../IOR.interface.mjs"
import ClassDescriptorInterface from "../Thing/ClassDescriptor.interface.mjs"
import InterfaceDescriptorInterface from "../Thing/InterfaceDescriptor.interface.mjs"
import UcpComponentDescriptorInterface from "../Thing/UcpComponentDescriptor.interface.mjs"
import FileUcpUnit from "../UCP/FileUcpUnit.interface.mjs"
import NamespaceInterface from "./Namespace.interface.mjs"
import UcpComponentFolder from "./UcpComponentFolder.interface.mjs"

export default interface NamespacePersistanceManager {
    readFromFile(path: string): NamespacePersistanceManagerReadFromFile
    readFromFile(ior: IOR): NamespacePersistanceManagerReadFromFile
    write2File(object: Exportable): void
    loadFilesInFolder(dirPath: string, filePostFix: string | RegExp): NamespacePersistanceManagerReadFromFile[]
    loadFoldersInFolder(dirPath: string, directoryPostFix: string | RegExp): NamespacePersistanceManagerReadFromFile[]
}

export type NamespacePersistanceManagerReadFromFile = ClassDescriptorInterface | InterfaceDescriptorInterface | NamespaceInterface | UcpComponentFolder | UcpComponentDescriptorInterface | FileUcpUnit