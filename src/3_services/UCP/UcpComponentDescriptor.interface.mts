import UcpUnit from "./UcpUnit.interface.mjs";

export default interface UcpComponentDescriptorExportInterface {
    name: string
    namespace: string
    version: string
    exportsFile: string
    units: UcpUnit[]
}

export interface UcpComponentDescriptorInterface extends UcpComponentDescriptorExportInterface {
    path: string
}