// ##IGNORE_TRANSFORMER##

import ComponentDescriptorExportFormat from "./ComponentDescriptorTransformer.interface.mjs";

export default interface InterfaceDescriptorExportFormat {
    componentDescriptor: ComponentDescriptorExportFormat
    location: string;
    name: string;
    extends?: InterfaceDescriptorExportFormat[];
    type: 'InterfaceDescriptor'
}