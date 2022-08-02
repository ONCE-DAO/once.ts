// ##IGNORE_TRANSFORMER##

import { ExportBaseDescriptorTR } from "./BaseDescriptorTR.class.mjs";
import ComponentDescriptorTR from "./ComponentDescriptor.class.mjs";
import DeclarationDescriptor from "./DeclarationDescriptor.class.mjs";
import InterfaceDescriptorExportFormat from "./interfaces2Move/InterfaceDescriptorTransformer.interface.mjs";

export default class InterfaceDescriptorTR extends ExportBaseDescriptorTR implements InterfaceDescriptorExportFormat {
    componentDescriptor: ComponentDescriptorTR;
    location: string;
    name: string;
    extends: InterfaceDescriptorTR[] = [];
    type: "InterfaceDescriptor" = "InterfaceDescriptor"

    constructor(declarationDescriptor: DeclarationDescriptor) {
        super(declarationDescriptor);
        this.componentDescriptor = declarationDescriptor.componentDescriptor;
        this.location = declarationDescriptor.location;
        this.name = declarationDescriptor.name;
        this.componentDescriptor.addDescriptor(this);
    }

    get export(): InterfaceDescriptorExportFormat {
        return {
            name: this.name,
            location: this.location,
            type: this.type,
            componentDescriptor: this.componentDescriptor.exportReference,
            extends: this.extends.map(x => x.export),
        }
    }

    get exportReference(): InterfaceDescriptorExportFormat {
        return {
            name: this.name,
            location: this.location,
            type: this.type,
            componentDescriptor: this.componentDescriptor.exportReference,
        }
    }


}