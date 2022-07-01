import UcpComponentDescriptorInterface from "../../3_services/UCP/UcpComponentDescriptor.interface.mjs";
import UcpUnit from "../../3_services/UCP/UcpUnit.interface.mjs";

export default class DefaultUcpComponentDescriptor implements UcpComponentDescriptorInterface {
    name: string;
    version: string;
    relativePath: string;
    units: UcpUnit[];

    constructor(name: string, version: string, relativePath: string, units: UcpUnit[]) {
        this.name = name;
        this.version = version;
        this.relativePath = relativePath;
        this.units = units;
    }

}