// ##IGNORE_TRANSFORMER##

import ComponentDescriptorExportFormat from "./ComponentDescriptorTransformer.interface.mjs";
import InterfaceDescriptorExportFormat from "./InterfaceDescriptorTransformer.interface.mjs";

export default interface ClassDescriptorExportFormat {
    componentDescriptor: ComponentDescriptorExportFormat
    location: string;
    name: string;
    implements: InterfaceDescriptorExportFormat[];
    type: 'ClassDescriptor'
}