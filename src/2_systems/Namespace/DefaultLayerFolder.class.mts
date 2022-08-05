import IOR from "../../3_services/IOR.interface.mjs";
import LayerFolder from "../../3_services/Namespace/LayerFolder.mjs";
import { NamespaceObjectTypeName } from "../../3_services/Namespace/Namespace.interface.mjs";
import DefaultIOR from "../NewThings/DefaultIOR.class.mjs";
import DefaultNamespace from "./DefaultNamespace.class.mjs";

// TODO is not used right now
export default class DefaultLayerFolder extends DefaultNamespace implements LayerFolder {
    objectType: LayerFolder["objectType"] = NamespaceObjectTypeName.LayerFolder;
    get layer(): number {
        let firstChar: string | number = this.name[0];
        if (firstChar.match(/^\d$/)) return +firstChar;
        throw new Error("Wrong name in LayerFolder " + this.name)
    }

    static get IOR(): IOR {
        // HACK with hardcoded IOR
        return new DefaultIOR().init('ior:esm:/tla/EAM/Once/once[build]/DefaultLayerFolder');
    }
    classDescriptor = { IOR: DefaultLayerFolder.IOR };
    get version(): string { return this.name }

    children: LayerFolder["children"] = [];

    protected _parent: LayerFolder["parent"] | undefined = undefined;

    get parent(): LayerFolder["parent"] {
        if (!this._parent)
            throw new Error("Missing parent")
        return this._parent
    }

    set parent(value: LayerFolder["parent"]) {
        this._parent = value
    }

}