import UcpDependency from "./UcpDependency.interface.mjs";
import UcpInterfaceObject from "./UcpInterface.class.mjs";
import UcpUnit from "./UcpUnit.interface.mjs";

export default interface UcpComponentDescriptorExportInterface {
    name: string
    namespace: string
    version: string
    displayName?: string
    stage?: UcpComponentDescriptorStage
    detailText?: string
    //Add later: displayImage
    exportsFile: string
    units: UcpUnit[]
    interfaceList?: UcpInterfaceObject[]
    dependencyList?: UcpDependency[]
}
export interface UcpComponentDescriptorInterface extends UcpComponentDescriptorExportInterface {
    path: string
}

export type UcpComponentDescriptorStage = 'development' | 'validate' | 'compile' | 'test' | 'package' | 'verify' | 'install' | 'deploy' | 'undefined'
