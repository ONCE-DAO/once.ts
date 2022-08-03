import AbstractNamespaceChild from "../../1_infrastructure/AbstractNamespaceChild.class.mjs";
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


export default class DefaultNamespace extends AbstractNamespaceChild implements NamespaceInterface {

    getParentType(typeName: NamespaceObjectTypeName.VersionFolder): VersionFolderInterface | undefined;
    getParentType(typeName: NamespaceObjectTypeName.LayerFolder): LayerFolder | undefined;
    getParentType(typeName: NamespaceObjectTypeName.Namespace): NamespaceInterface | undefined;
    getParentType(typeName: NamespaceObjectTypeName.UcpComponentFolder): UcpComponentFolderInterface | undefined;
    getParentType(typeName: NamespaceObjectTypeName): NamespaceInterface | VersionFolderInterface | UcpComponentFolderInterface | LayerFolder | undefined {
        if (this.objectType === typeName) return this;
        if (this._parent && "getParentType" in this.parent) return this.parent.getParentType(typeName as NamespaceObjectTypeName.VersionFolder)
    }


    static get IOR(): IOR {
        // HACK with hardcoded IOR
        return new DefaultIOR().init('ior:esm:/tla/EAM/Once/once[build]/DefaultNamespace');
    }
    classDescriptor = { IOR: DefaultNamespace.IOR };

    children: NamespaceChildren[] = [];


    add(object: NamespaceChildren, location: string[], checkOverwrite: boolean = true): void {
        if ("name" in object) {
            if (location.length > 1) {
                this.getOrCreateChild(location.shift() as string).add(object, location, checkOverwrite)
            } else {
                const existingObject = checkOverwrite ? this.getChildByName(object.name) : undefined;
                if (existingObject === object) return;
                object.parent = this;
                this.children.push(object);
                if (existingObject && existingObject instanceof DefaultNamespace && "objectType" in object) {
                    for (const child of existingObject.children) {
                        // if ("objectType" in child && child.objectType === NamespaceObjectTypeName.VersionFolder)
                        //@ts-ignore
                        object.children.push(child);
                    }

                }
                if (existingObject) this.removeChild(existingObject);

            }
        } else {
            throw new Error("Unknown Object was added")
        }
    }

    recursiveChildren(types?: NamespaceObjectTypeName[]): NamespaceChildren[] {
        let result: NamespaceChildren[] = [];
        for (const child of this.children) {
            if (!types || types.includes(child.objectType)) {
                result.push(child);
            }
            if ("recursiveChildren" in child) {
                result.push(...child.recursiveChildren(types));
            }
        }
        return result;
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
        result["This"] = this;
        return result;
    }

    export(): NamespaceFileFormat {
        return { name: this.name }
    }

    import(data: NamespaceFileFormat): void {
        this.name = data.name
    }

    search(packageString: string): NamespaceChildren | undefined
    search(ior: IOR): NamespaceChildren | undefined
    search(originalLocation: string[]): NamespaceChildren | undefined
    search(arg1: IOR | string[] | string): NamespaceChildren | undefined {
        let location: string[];
        if (!Array.isArray(arg1)) {
            if (typeof arg1 === "string") {
                location = arg1.split(".");
            } else {
                if (!arg1.path) throw new Error("Missing path in the IOR")
                // HACK with []
                location = arg1.path.replaceAll(/[\[\]]/g, '').split('/').filter(x => x !== "");
            }
        } else {
            location = [...arg1]
        }

        if (location.length === 0) return undefined;
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
