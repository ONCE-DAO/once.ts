import UcpComponentDescriptorInterface from "../../3_services/UCP/UcpComponentDescriptor.interface.mjs";
import UcpUnit from "../../3_services/UCP/UcpUnit.interface.mjs";

export default class DefaultUcpComponentDescriptor implements UcpComponentDescriptorInterface {
    name: string;
    namespace: string;
    version: string;
    units: UcpUnit[];
    exportsFile: string;


    constructor(name: string, namespace: string, version: string, exportsFile: string, units: UcpUnit[]) {
        this.name = name;
        this.namespace = namespace;
        this.version = version;
        this.exportsFile = exportsFile;
        this.units = units;
    }
}