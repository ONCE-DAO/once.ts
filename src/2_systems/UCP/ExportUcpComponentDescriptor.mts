import UcpComponentDescriptorExportInterface, { UcpComponentDescriptorInterface } from "../../3_services/UCP/UcpComponentDescriptor.interface.mjs";
import UcpUnit from "../../3_services/UCP/UcpUnit.interface.mjs";

export default class ExportUcpComponentDescriptor implements UcpComponentDescriptorExportInterface {
    name: string;
    namespace: string;
    version: string;
    units: UcpUnit[];
    exportsFile: string;
    exports: {
        [file: string]: { [objectName: string]: { name: string, defaultExport: boolean } }
    } = {}

    constructor(descriptor: UcpComponentDescriptorExportInterface) {
        this.name = descriptor.name;
        this.namespace = descriptor.namespace;
        this.version = descriptor.version;
        this.exportsFile = descriptor.exportsFile;
        this.units = descriptor.units;
        if (descriptor.exports) this.exports = descriptor.exports;
    }
}
