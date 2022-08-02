// ##IGNORE_TRANSFORMER##

import { ExportBaseDescriptorTR } from "./BaseDescriptorTR.class.mjs";
import ComponentDescriptorTR from "./ComponentDescriptor.class.mjs";
import DeclarationDescriptor from "./DeclarationDescriptor.class.mjs";
import InterfaceDescriptorTR from "./InterfaceDescriptorTR.class.mjs";
import ClassDescriptorExportFormat from "./interfaces2Move/ClassDescriptorTransformer.interface.mjs";

export default class ClassDescriptorTR extends ExportBaseDescriptorTR implements ClassDescriptorExportFormat {
    type: "ClassDescriptor" = "ClassDescriptor";
    name: string;
    location: string;
    componentDescriptor: ComponentDescriptorTR;
    implements: InterfaceDescriptorTR[] = [];

    add(object: InterfaceDescriptorTR) {
        this.implements.push(object);
    }

    constructor(declarationDescriptor: DeclarationDescriptor) {
        super(declarationDescriptor)
        this.location = declarationDescriptor.location;
        this.name = declarationDescriptor.name;
        this.componentDescriptor = declarationDescriptor.componentDescriptor;
        this.componentDescriptor.addDescriptor(this);
    }

    get export(): ClassDescriptorExportFormat {
        return {
            name: this.name,
            location: this.location,
            type: this.type,
            componentDescriptor: this.componentDescriptor.exportReference,
            implements: this.implements.map(x => x.exportReference)
        };
    }

}