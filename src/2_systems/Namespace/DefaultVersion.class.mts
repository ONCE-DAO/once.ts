import IOR from "../../3_services/IOR.interface.mjs";
import { NamespaceObjectTypeName } from "../../3_services/Namespace/Namespace.interface.mjs";
import VersionFolder from "../../3_services/Namespace/VersionFolder.interface.mjs";
import DefaultIOR from "../NewThings/DefaultIOR.class.mjs";
import DefaultNamespace from "./DefaultNamespace.class.mjs";

export default class DefaultVersion extends DefaultNamespace implements VersionFolder {
    objectType: NamespaceObjectTypeName.VersionFolder = NamespaceObjectTypeName.VersionFolder;
    static get IOR(): IOR {
        // HACK with hardcoded IOR
        return new DefaultIOR().init('ior:esm:/tla/EAM/Once/once[build]/DefaultVersion');
    }
    classDescriptor = { IOR: DefaultVersion.IOR };
    get version(): string { return this.name }

    children: VersionFolder["children"] = [];

    protected _parent: VersionFolder["parent"] | undefined = undefined;

    get parent(): VersionFolder["parent"] {
        if (!this._parent)
            throw new Error("Missing parent")
        return this._parent
    }

    set parent(value: VersionFolder["parent"]) {
        this._parent = value
    }

}