import UcpUnit from "./UcpUnit.interface.mjs";

export default interface UcpComponentDescriptorInterface {
    name: string
    namespace: string
    version: string
    exportsFile: string
    units: UcpUnit[]
    
}