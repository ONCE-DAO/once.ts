import DefaultIOR from "../2_systems/NewThings/DefaultIOR.class.mjs";
import IOR from "../3_services/IOR.interface.mjs";
import { NamespaceChild, NamespaceObjectTypeName, NamespaceParent } from "../3_services/Namespace/Namespace.interface.mjs";

export default abstract class AbstractNamespaceChild implements NamespaceChild {
    abstract export(): any
    abstract import(data: any): void

    abstract classDescriptor: { IOR: IOR; };
    protected _parent: NamespaceParent | undefined = undefined;
    name: string = "";
    objectType: NamespaceObjectTypeName = NamespaceObjectTypeName.Namespace;

    get package(): string {
        return this.location.join('.');
    }

    public get location(): string[] {
        if (!this._parent && this.name === "") return [];
        let parentLocation = this.parent.location;
        parentLocation.push(this.name);
        return parentLocation;
    }

    get parent(): NamespaceParent {
        if (!this._parent)
            throw new Error("Missing parent")
        return this._parent
    }
    set parent(value: NamespaceParent) {
        this._parent = value
    }

    get IOR(): IOR {
        if (this._parent === undefined) {
            return new DefaultIOR().init('ior:meta:/')
        } else {
            let ior = this.parent.IOR;
            ior.pathName = ior.pathName === '/' ? `/${this.name}` : ior.pathName + `/${this.name}`;
            return ior;
        }
    };


    public relativeComponentLocation(location: string[] = []): string[] | undefined {
        if (!this._parent) return undefined;
        location.unshift(this.name)
        if (this.parent.objectType === NamespaceObjectTypeName.VersionFolder) return location;
        return this.parent.relativeComponentLocation(location);
    }

}