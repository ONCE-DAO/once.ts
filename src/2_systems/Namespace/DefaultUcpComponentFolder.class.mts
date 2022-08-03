import IOR from "../../3_services/IOR.interface.mjs";
import { NamespaceObjectTypeName } from "../../3_services/Namespace/Namespace.interface.mjs";
import UcpComponentFolder from "../../3_services/Namespace/UcpComponentFolder.interface.mjs";
import DefaultIOR from "../NewThings/DefaultIOR.class.mjs";
import DefaultNamespace from "./DefaultNamespace.class.mjs";

export default class DefaultUcpComponentFolder extends DefaultNamespace implements UcpComponentFolder {
    objectType: NamespaceObjectTypeName.UcpComponentFolder = NamespaceObjectTypeName.UcpComponentFolder;

    static get IOR(): IOR {
        // HACK with hardcoded IOR
        return new DefaultIOR().init('ior:esm:/tla/EAM/Once/once[build]/DefaultUcpComponentFolder');
    }


    classDescriptor = { IOR: DefaultUcpComponentFolder.IOR };

    children: UcpComponentFolder["children"] = [];

    protected _parent: UcpComponentFolder["parent"] | undefined = undefined;

    get parent(): UcpComponentFolder["parent"] {
        if (!this._parent)
            throw new Error("Missing parent")
        return this._parent
    }

    set parent(value: UcpComponentFolder["parent"]) {
        this._parent = value
    }

}