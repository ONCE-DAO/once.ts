import UcpComponentDescriptorExportInterface, { UcpComponentDescriptorStage } from "../../3_services/UCP/UcpComponentDescriptor.interface.mjs";
import UcpDependency from "../../3_services/UCP/UcpDependency.interface.mjs";
import UcpInterfaceObject from "../../3_services/UCP/UcpInterface.class.mjs";
import UcpUnit from "../../3_services/UCP/UcpUnit.interface.mjs";

export default class ExportUcpComponentDescriptor implements UcpComponentDescriptorExportInterface {
    name: string;
    namespace: string;
    version: string;
    stage: UcpComponentDescriptorStage = 'development';
    displayName: string = '';
    exportsFile: string;
    detailText: string = '';
    units: UcpUnit[];
    interfaceList: UcpInterfaceObject[] = []
    dependencyList: UcpDependency[] = [];

    constructor(descriptor: UcpComponentDescriptorExportInterface) {
        this.name = descriptor.name;
        this.namespace = descriptor.namespace;
        this.version = descriptor.version;
        this.exportsFile = descriptor.exportsFile;
        this.units = descriptor.units;
        if (descriptor.interfaceList) this.interfaceList = descriptor.interfaceList;
        if (descriptor.dependencyList) this.dependencyList = descriptor.dependencyList;
        if (descriptor.stage) this.stage = descriptor.stage;
        if (descriptor.detailText) this.detailText = descriptor.detailText;

    }

}
