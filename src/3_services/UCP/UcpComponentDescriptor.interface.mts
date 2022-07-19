import UcpUnit from "./UcpUnit.interface.mjs";

export default interface UcpComponentDescriptorExportInterface {
    name: string
    namespace: string
    version: string
    exportsFile: string
    units: UcpUnit[]
    exports?: { [file: string]: { [objectName: string]: { name: string, defaultExport: boolean } } }
}

export interface UcpComponentDescriptorInterface extends UcpComponentDescriptorExportInterface {
    path: string
}