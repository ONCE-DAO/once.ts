import UcpUnit from "./UcpUnit.interface.mjs";

export default interface UcpComponentDescriptorInterface {
    name: string
    version: string
    relativePath: string
    exportsFile: string
    units: UcpUnit[]
    
}