import UcpComponentDescriptorExportInterface, { UcpComponentDescriptorInterface } from "../../3_services/UCP/UcpComponentDescriptor.interface.mjs";
import ExportUcpComponentDescriptor from "./ExportUcpComponentDescriptor.mjs";

export default class DefaultUcpComponentDescriptor extends ExportUcpComponentDescriptor implements UcpComponentDescriptorInterface {
    path: string;

    constructor(descriptor: UcpComponentDescriptorExportInterface, path: string) {
        super(descriptor);
        this.path = path;
    }
}