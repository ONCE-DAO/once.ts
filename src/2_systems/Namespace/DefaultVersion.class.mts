import IOR from "../../3_services/IOR.interface.mjs";
import { NamespaceObjectTypeName } from "../../3_services/Namespace/Namespace.interface.mjs";
import VersionFolder from "../../3_services/Namespace/VersionFolder.interface.mjs";
import UcpComponentDescriptorInterface from "../../3_services/Thing/UcpComponentDescriptor.interface.mjs";
import DefaultIOR from "../NewThings/DefaultIOR.class.mjs";
import DefaultNamespace from "./DefaultNamespace.class.mjs";

export default class DefaultVersion extends DefaultNamespace implements VersionFolder {
    objectType: NamespaceObjectTypeName.VersionFolder = NamespaceObjectTypeName.VersionFolder;
    classDescriptor = { IOR: DefaultVersion.IOR };
    protected _parent: VersionFolder["parent"] | undefined = undefined;
    children: VersionFolder["children"] = [];

    get IOR(): IOR {
        let ior = this.parent.IOR;
        ior.pathName += `/[${this.name}]`;
        return ior;
    }

    get ucpComponentDescriptor(): UcpComponentDescriptorInterface {
        let c = this.getChildByName(this.parent.name);
        if (c && "units" in c) return c;
        throw new Error("Could not find ucpComponentDescriptor in Namespace")
    }

    get version(): string { return this.name }

    get package(): string { return this.location.join('.') }

    get parent(): VersionFolder["parent"] {
        if (!this._parent)
            throw new Error("Missing parent")
        return this._parent
    }

    set parent(value: VersionFolder["parent"]) {
        this._parent = value
    }

    static get IOR(): IOR {
        // HACK with hardcoded IOR
        return new DefaultIOR().init('ior:esm:/tla/EAM/Once/once[build]/DefaultVersion');
    }
}