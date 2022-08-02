import Exportable from "../../3_services/Exportable.interface.mjs";
import File from "../../3_services/File/File.interface.mjs";
import IOR from "../../3_services/IOR.interface.mjs";
import LayerFolder from "../../3_services/Namespace/LayerFolder.mjs";
import NamespaceInterface, { NamespaceBrowsable, NamespaceChildren, NamespaceFileFormat, NamespaceObjectTypeName, NamespaceParent } from "../../3_services/Namespace/Namespace.interface.mjs";
import UcpComponentFolderInterface from "../../3_services/Namespace/UcpComponentFolder.interface.mjs";
import VersionFolderInterface from "../../3_services/Namespace/VersionFolder.interface.mjs";
import DefaultIOR from "../NewThings/DefaultIOR.class.mjs";
// import OnceInternalPersistenceManager from "../Things/OnceInternalPersistenceManager.class.mjs";

// let possibleChildrenClasses = [
//     (await import("./DefaultUcpComponentFolder.class.mjs")).default,
//     (await import("./DefaultVersion.class.mjs")).default
// ];


export default class DefaultNamespace implements NamespaceInterface, Exportable {

    objectType: NamespaceObjectTypeName = NamespaceObjectTypeName.NamespaceInterface;

    private _IOR: IOR | undefined;


    get IOR(): IOR {
        if (!this._IOR) {
            if (this.name === "") throw new Error("Missing name")
            this._IOR = new DefaultIOR().init('ior:meta:/' + this.location.join('/') + `/object`);
        }
        return this._IOR;
    };

    get getAllLoadedChildren(): NamespaceChildren[] {
        let result: NamespaceChildren[] = [this];
        for (const child of this.children) {
            if ("getAllLoadedChildren" in child) {
                result.push(...child.getAllLoadedChildren);
            } else {
                result.push(child);
            }
        }
        return result;
    }
    // TODO add InterfaceDescriptor
    //** A Enum is needed because of Bootstrap. By default is should be a InterfaceDescriptor */
    getParentInstanceType(instanceTypeName: NamespaceObjectTypeName): NamespaceChildren | undefined {
        if (this.constructor.name == instanceTypeName) {
            return this;
        }
        if (this._parent) {
            return this._parent.getParentInstanceType(instanceTypeName);
        } else {
            return undefined;
        }

    }

    static get IOR(): IOR {
        // HACK with hardcoded IOR
        return new DefaultIOR().init('ior:esm:/tla/EAM/Once/once[build]/DefaultNamespace');
    }
    classDescriptor = { IOR: DefaultNamespace.IOR };

    name: string = "";
    children: NamespaceChildren[] = [];

    protected _parent: NamespaceParent | undefined = undefined;
    get parent(): NamespaceParent {
        if (!this._parent)
            throw new Error("Missing parent")
        return this._parent
    }
    set parent(value: NamespaceParent) {
        this._parent = value
    }

    add(object: NamespaceChildren, location: string[], checkOverwrite: boolean = true): void {
        if ("name" in object) {
            if (location.length > 1) {
                this.getOrCreateChild(location.shift() as string).add(object, location)
            } else {
                const existingObject = checkOverwrite ? this.getChildByName(object.name) : undefined;
                object.parent = this;
                this.children.push(object);
                if (existingObject && existingObject instanceof DefaultNamespace && "objectType" in object) {
                    for (const child of existingObject.children) {
                        // if ("objectType" in child && child.objectType === NamespaceObjectTypeName.VersionFolder)
                        //@ts-ignore
                        object.children.push(child);
                    }

                }

            }
        } else {
            throw new Error("Unknown Object was added")
        }
    }

    removeChild(child: NamespaceChildren): void {
        this.children = this.children.filter(x => x !== child)
    }

    get browsable(): NamespaceBrowsable {
        let result: NamespaceBrowsable = {};
        for (const child of this.children) {
            if (child.name)
                result[child.name] = "browsable" in child ? child.browsable : child
        }
        return result;
    }

    export(): NamespaceFileFormat {
        return { name: this.name }
    }

    import(data: NamespaceFileFormat): void {
        this.name = data.name
    }

    search(ior: IOR): NamespaceChildren | undefined
    search(originalLocation: string[]): NamespaceChildren | undefined
    search(arg1: IOR | string[]): NamespaceChildren | undefined {
        if (!Array.isArray(arg1)) {
            if (!arg1.path) throw new Error("Missing path in the IOR")
            arg1 = arg1.path.split('/');
        }
        if (arg1.length == 0) return undefined;
        const location = [...arg1]
        const name = location.shift() as string;

        let child = this.getChildByName(name);
        if (child === undefined) return undefined;

        if (child && "children" in child && "search" in child) {
            return child.search(location);
        } else {
            return child;
        }
    }

    async discover(name?: string, options?: { recursive?: boolean, level?: number }): Promise<NamespaceChildren[]> {
        let resultList: NamespaceChildren[] = [];
        if (ONCE.isNodeJSEnvironment) {

            let level = options?.level || 0;

            let OnceInternalPersistenceManager = (await import("../Things/OnceInternalPersistenceManager.class.mjs")).default;

            //TODO zentrale haltung von 'meta.json'
            let filePostFix: string | RegExp = name ? new RegExp(`^${name}\..*meta.json$`) : 'meta.json';

            resultList = OnceInternalPersistenceManager.loadFilesInFolder(this.location.join('/'), filePostFix);
            for (const newChid of resultList) {
                this.add(newChid, [], false)
            }

            let resultSubDir = OnceInternalPersistenceManager.loadFoldersInFolder([...this.location].join('/'), name || '');
            for (const newChid of resultSubDir) {
                this.add(newChid, [], false)
                resultList.push(newChid);
            }

            if (options && options.recursive) {
                for (const child of this.children) {
                    if ("discover" in child)
                        resultList.push(...(await child.discover(undefined, { recursive: true, level: level + 1 })));
                }
            }

            if (level == 0) {
                for (const child of resultList) {
                    if ("implements" in child) {
                        child.registerAllInterfaces();
                    }
                }
            }
        }
        return resultList;
    }

    public get location(): string[] {
        if (!this._parent && this.name === "") return [];
        let parentLocation = this.parent.location;
        parentLocation.push(this.name);
        return parentLocation;
    }



    init(name: string, parent: NamespaceParent): this {
        this.name = name;
        this.parent = parent;
        return this;
    }

    private getOrCreateChild(name: string): NamespaceInterface {
        let existingChild = this.getChildByName(name);
        if (existingChild && "getChildByName" in existingChild) {
            return existingChild
        } else {
            return this.createChild(name);
        }
    }

    private createChild(name: string): NamespaceInterface {
        // let childClass: NamespaceInterface | undefined;
        // for (let possibleChild of possibleChildrenClasses) {
        //     if (possibleChild.canHandle(name, this)) {

        //     }
        // }
        let child = new DefaultNamespace().init(name, this);
        child.parent = this;
        this.children.push(child);
        return child;
    }

    getParentType(typeName: "VersionFolder"): VersionFolderInterface | undefined;
    getParentType(typeName: "LayerFolder"): LayerFolder | undefined;
    getParentType(typeName: "UcpComponentFolder"): UcpComponentFolderInterface | undefined;
    getParentType(typeName: "Namespace"): NamespaceInterface | undefined;
    getParentType(typeName: unknown): NamespaceInterface | import("../../3_services/Namespace/VersionFolder.interface.mjs").default | import("../../3_services/Namespace/UcpComponentFolder.interface.mjs").default | import("../../3_services/Namespace/LayerFolder.mjs").default | undefined {
        throw new Error("Method not implemented.");
    }

    getChildByName(name: string): NamespaceChildren | undefined {
        let child: NamespaceChildren | undefined = this.children.filter(childName => childName.name === name)[0];
        return child;
    }


    getFilesByOnceExtentions(extensions?: string[] | undefined, recursive?: boolean | undefined): File[] {
        throw new Error("Method not implemented.");
    }
    getFilesByExtentions(extensions?: string[] | undefined, recursive?: boolean | undefined): File[] {
        throw new Error("Method not implemented.");
    }
    getFilesByFileName(extensions?: string[] | undefined, recursive?: boolean | undefined): File[] {
        throw new Error("Method not implemented.");
    }
    get fullPath(): string {
        throw new Error("Method not implemented.");
    }
    get basePath(): string {
        throw new Error("Method not implemented.");
    }
    get exists(): boolean {
        throw new Error("Method not implemented.");
    }
    get extension(): string {
        throw new Error("Method not implemented.");
    }
    get onceExtension(): string {
        throw new Error("Method not implemented.");
    }
    get filename(): string {
        throw new Error("Method not implemented.");
    }
    write(content: string): void {
        throw new Error("Method not implemented.");
    }
    read(): string {
        throw new Error("Method not implemented.");
    }
}

DefaultNamespace
