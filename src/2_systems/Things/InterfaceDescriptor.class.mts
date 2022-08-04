// ##IGNORE_TRANSFORMER##
import AbstractNamespaceChild from "../../1_infrastructure/AbstractNamespaceChild.class.mjs";
import DeclarationDescriptor from "../../1_infrastructure/Build/Typescript/Transformer/DeclarationDescriptor.class.mjs";
import Class from "../../3_services/Class.interface.mjs";
import IOR from "../../3_services/IOR.interface.mjs";
import { NamespaceObjectTypeName, NamespaceParent } from "../../3_services/Namespace/Namespace.interface.mjs";
import VersionFolder from "../../3_services/Namespace/VersionFolder.interface.mjs";
import ClassDescriptorInterface from "../../3_services/Thing/ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface, { InterfaceDescriptorFileFormat } from "../../3_services/Thing/InterfaceDescriptor.interface.mjs";
import UcpComponentDescriptorInterface from "../../3_services/Thing/UcpComponentDescriptor.interface.mjs";
import FileUcpUnit from "../../3_services/UCP/FileUcpUnit.interface.mjs";
import { UnitType } from "../../3_services/UCP/UcpUnit.interface.mjs";
import DefaultIOR from "../NewThings/DefaultIOR.class.mjs";

export default class InterfaceDescriptor extends AbstractNamespaceChild implements InterfaceDescriptorInterface {
    unitType: UnitType = UnitType.TypescriptInterface;
    objectType: NamespaceObjectTypeName.InterfaceDescriptor = NamespaceObjectTypeName.InterfaceDescriptor

    get ucpComponentDescriptor(): UcpComponentDescriptorInterface {
        return this.version.ucpComponentDescriptor;
    }

    get version(): VersionFolder {
        let v = this.parent.getParentType(NamespaceObjectTypeName.VersionFolder);
        if (!v) throw new Error("Missing Parent Version")
        return v;
    }

    fileExport: 'defaultExport' | 'namedExport' | 'noExport' = 'noExport';


    static get IOR(): IOR {
        // HACK with hardcoded IOR
        return new DefaultIOR().init('ior:esm:/tla/EAM/Once/once[build]/InterfaceDescriptor');
    }
    classDescriptor = { IOR: InterfaceDescriptor.IOR };

    init(declarationDescriptor: DeclarationDescriptor): this {
        this.name = declarationDescriptor.name;
        this._fileUnit = declarationDescriptor.fileUnitFactory();
        ONCE.rootNamespace.add(this, declarationDescriptor.packageAndLocation);
        this.fileExport = declarationDescriptor.exportType();
        this.componentExport = this.fileExport === "noExport" ? "noExport" : "namedExport"
        return this;
    }

    private _fileUnit: FileUcpUnit | IOR | undefined;
    public get fileUnit(): FileUcpUnit {
        if (!this._fileUnit) throw new Error("Missing filename");
        if ("pathName" in this._fileUnit) {
            let loaded = ONCE.rootNamespace.search(this._fileUnit);
            if (loaded && "relativeComponentPath" in loaded)
                this._fileUnit = loaded;
        }
        if ("pathName" in this._fileUnit)
            throw new Error("Fail to load IOR:" + this._fileUnit);
        return this._fileUnit;
    }

    export(): InterfaceDescriptorFileFormat {
        return {
            name: this.name,
            extends: this.extends.map(i => i.IOR.href),
            fileUnit: this._fileUnit && "pathName" in this._fileUnit ? this._fileUnit.href : this.fileUnit.IOR.href,
            fileExport: this.fileExport,
            componentExport: this.componentExport
        }
    }

    import(data: InterfaceDescriptorFileFormat): void {
        this.name = data.name;
        this._fileUnit = new DefaultIOR().init(data.fileUnit);
        this.extends = data.extends.map(i => ONCE.rootNamespace.search(new DefaultIOR().init(i)) as InterfaceDescriptorInterface);
        this.fileExport = data.fileExport;
        this.componentExport = data.componentExport;
    }


    id: string = Math.round(Math.random() * 10000000) + '';

    extends: InterfaceDescriptorInterface[] = [];
    private readonly _implementations: ClassDescriptorInterface[] = [];

    async getImplementations(): Promise<Class<any>[]> {
        let result: Class<any>[] = [];

        for (const classDescriptor of this._implementations) {
            result.push(await classDescriptor.getClass());
        }
        return result;
    }


    get allExtendedInterfaces(): InterfaceDescriptorInterface[] {
        let result: InterfaceDescriptorInterface[] = [];
        for (const interfaceObject of this.extends) {
            result.push(interfaceObject);
            const subInterfaces = interfaceObject.allExtendedInterfaces;
            if (subInterfaces.length > 0) result.push(...subInterfaces);
        }
        return result;
    }

    get implementedInterfaces(): InterfaceDescriptorInterface[] {
        return this._getImplementedInterfaces();
    }

    componentExport: 'namedExport' | 'defaultExport' | 'noExport' = 'noExport';

    _getImplementedInterfaces(interfaceList: InterfaceDescriptorInterface[] = []): InterfaceDescriptorInterface[] {
        if (!interfaceList.includes(this)) {
            interfaceList.push(this);
            for (const interfaceObject of this.extends) {
                interfaceObject._getImplementedInterfaces(interfaceList);
            }
        }
        return interfaceList;
    }

    addImplementation(classDescriptor: ClassDescriptorInterface): InterfaceDescriptorInterface {
        this._implementations.push(classDescriptor);
        return this
    }


    add(object: InterfaceDescriptorInterface): this {
        if (object instanceof InterfaceDescriptor) {
            this.extends.push(object)
        }
        return this;
    }

}
