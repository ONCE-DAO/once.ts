import UcpUnit from "./UcpUnit.interface.mjs";

// unknown in case the type can not be discovered
type interfaceType = 'TypescriptClass' | 'TypescriptInterface' | 'TypescriptType' | 'TypescriptEnum' | "unknown"

export interface UcpComponentDescriptorInterfaceObject {
    type: interfaceType,
    name: string,
    unitDefaultExport: boolean,
    unitName: string
}

export interface UcpComponentDescriptorDependencyObject {
    type: 'IOR' | 'npm',
    name: string,
    reference: string;
}

export default interface UcpComponentDescriptorExportInterface {
    name: string
    namespace: string
    version: string
    exportsFile: string
    units: UcpUnit[]
    interfaceList?: UcpComponentDescriptorInterfaceObject[]
    dependencyList?: UcpComponentDescriptorDependencyObject[]
}
export interface UcpComponentDescriptorInterface extends UcpComponentDescriptorExportInterface {
    path: string
}