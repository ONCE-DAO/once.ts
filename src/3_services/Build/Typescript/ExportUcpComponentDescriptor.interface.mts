import UcpComponentDescriptorExportInterface from "../../UCP/UcpComponentDescriptor.interface.mjs";
import NpmPackageInterface from "../Npm/NpmPackage.interface.mjs";

export default interface BuildUcpComponentDescriptorInterface extends UcpComponentDescriptorExportInterface {
    importFile(filename: string): void
    addNpmPackageInfos(npmPackage: NpmPackageInterface): void
    addUnitFiles(files: string[]): void
    writeComponentDescriptor(filename: string): void

}