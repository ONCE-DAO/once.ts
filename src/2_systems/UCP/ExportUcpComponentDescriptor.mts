import UcpComponentDescriptorExportInterface, { UcpComponentDescriptorInterface, UcpComponentDescriptorInterfaceObject } from "../../3_services/UCP/UcpComponentDescriptor.interface.mjs";
import UcpUnit from "../../3_services/UCP/UcpUnit.interface.mjs";

export default class ExportUcpComponentDescriptor implements UcpComponentDescriptorExportInterface {
    name: string;
    namespace: string;
    version: string;
    units: UcpUnit[];
    exportsFile: string;
    interfaceList: UcpComponentDescriptorInterfaceObject[] = []

    constructor(descriptor: UcpComponentDescriptorExportInterface) {
        this.name = descriptor.name;
        this.namespace = descriptor.namespace;
        this.version = descriptor.version;
        this.exportsFile = descriptor.exportsFile;
        this.units = descriptor.units;
        if (descriptor.interfaceList) this.interfaceList = descriptor.interfaceList;
    }
}
