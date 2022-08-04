import AbstractNamespaceChild from "../../1_infrastructure/AbstractNamespaceChild.class.mjs";
import DeclarationDescriptor from "../../1_infrastructure/Build/Typescript/Transformer/DeclarationDescriptor.class.mjs";
import Class from "../../3_services/Class.interface.mjs";
import IOR from "../../3_services/IOR.interface.mjs";
import { NamespaceObjectTypeName } from "../../3_services/Namespace/Namespace.interface.mjs";
import VersionFolder from "../../3_services/Namespace/VersionFolder.interface.mjs";
import ClassDescriptorInterface, { ClassDescriptorFileFormat } from "../../3_services/Thing/ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface from "../../3_services/Thing/InterfaceDescriptor.interface.mjs";
import Thing from "../../3_services/Thing/Thing.interface.mjs";
import UcpComponentDescriptorInterface from "../../3_services/Thing/UcpComponentDescriptor.interface.mjs";
import FileUcpUnit from "../../3_services/UCP/FileUcpUnit.interface.mjs";
import DefaultIOR from "../NewThings/DefaultIOR.class.mjs";
import InterfaceDescriptorHandler from "./InterfaceDescriptorHandler.class.mjs";


export default class ClassDescriptor extends AbstractNamespaceChild implements ClassDescriptorInterface {
    fileExport: 'defaultExport' | 'namedExport' | 'noExport' = 'noExport';
    objectType: NamespaceObjectTypeName.ClassDescriptor = NamespaceObjectTypeName.ClassDescriptor;

    static get IOR(): IOR {
        // HACK with hardcoded IOR
        return new DefaultIOR().init('ior:esm:/tla/EAM/Once/once[build]/ClassDescriptor');
    }
    classDescriptor = { IOR: ClassDescriptor.IOR };


    private _fileUnit: FileUcpUnit | IOR | undefined;
    public get fileUnit(): FileUcpUnit {
        if (!this._fileUnit) throw new Error("Missing filename");
        if ("pathName" in this._fileUnit) {
            let loaded = ONCE.rootNamespace.search(this._fileUnit);
            if (loaded && "relativeComponentPath" in loaded)
                this._fileUnit = loaded;
        }
        if ("pathName" in this._fileUnit) throw new Error("Fail to load IOR:" + this._fileUnit);
        return this._fileUnit;
    }


    componentExport: 'defaultExport' | 'namedExport' | 'noExport' = 'namedExport';

    export(): ClassDescriptorFileFormat {
        return {
            name: this.name,
            interfaces: this._interfaces.map(i => "IOR" in i ? i.IOR.href : i.href),
            fileUnit: this.fileUnit.IOR.href,
            extends: this.extends?.IOR?.href,
            // classIOR: this.classIOR.href,
            componentExport: this.componentExport,
            fileExport: this.fileExport
        }
    }

    import(data: ClassDescriptorFileFormat): void {
        this.name = data.name;
        if (data.extends)
            this._extends = new DefaultIOR().init(data.extends);
        //this._classIOR = new DefaultIOR().init(data.classIOR);
        this._fileUnit = new DefaultIOR().init(data.fileUnit);
        this.componentExport = data.componentExport;
        this.fileExport = data.fileExport;
        // if (data.interfaces)
        this._interfaces = data.interfaces.map(i => new DefaultIOR().init(i));
    }

    /**
     * Init for the Transpiling Process
     * @param declarationDescriptor 
     * @returns 
     */
    init(declarationDescriptor: DeclarationDescriptor): this {
        this.name = declarationDescriptor.name;
        // this.filename = declarationDescriptor.path;
        let heritageClass = declarationDescriptor.heritageClassDescriptor();
        if (heritageClass) {
            this._extends = heritageClass;
        }


        this._fileUnit = declarationDescriptor.fileUnitFactory()
        this.fileExport = declarationDescriptor.exportType();
        this.componentExport = this.fileExport === "noExport" ? "noExport" : "namedExport";

        ONCE.rootNamespace.add(this, declarationDescriptor.packageAndLocation);

        return this;
    }

    get componentExportName(): string {
        if (!this.name) throw new Error("No name");
        return this.name;
    }

    get ucpComponentDescriptor(): UcpComponentDescriptorInterface {
        return this.version.ucpComponentDescriptor
    }

    get version(): VersionFolder {
        let version = this.parent.getParentType(NamespaceObjectTypeName.VersionFolder)
        if (version == undefined) throw new Error("Can not find version")
        return version;
    }

    get classIOR(): IOR {
        //HACK
        let versionIOR = this.version.IOR;
        if (!versionIOR || !versionIOR.pathName) throw new Error("Missing versionIOR");
        let newPath = versionIOR.pathName.replaceAll(/(.)\//g, '$1.').replace(/\.\[/, '[')
        return new DefaultIOR().init('ior:esm:' + newPath + '/' + this.name)
    }


    implements(interfaceObject: InterfaceDescriptorInterface): boolean {
        return this.implementedInterfaces.includes(interfaceObject);
    }

    implementsInterface<CheckInterface extends Thing<any>>(object: Thing<any>, location?: string[]): object is CheckInterface {
        if (!location) throw new Error("Missing location. Check Transpiler?")
        let interfaceDescriptor = InterfaceDescriptorHandler.getInterfaceDescriptor(location);
        if (!interfaceDescriptor) throw new Error("Missing interfaceDescriptor " + location.join("."));
        return this.implements(interfaceDescriptor)
    }

    //TODO Change that to Component export path
    get classPackageString(): string {
        return `${this.version.parent.name}.${this.version.parent.name}[${this.version.name}]/${this.name}`
    }

    private _class: any;
    private _interfaces: (InterfaceDescriptorInterface | IOR)[] = [];
    private _extends: ClassDescriptorInterface | IOR | undefined;
    get extends(): (ClassDescriptorInterface | undefined) {
        if (this._extends && "href" in this._extends) {
            let loadedObject = ONCE.rootNamespace.search(this._extends);
            if (loadedObject && "implements" in loadedObject) {
                this._extends = loadedObject;
            }
        }
        if (this._extends && "href" in this._extends)
            throw new Error("Fail to load extends IOR: " + this._extends.href)
        return this._extends as ClassDescriptorInterface | undefined;
    };

    // TODO Missing Type
    async getClass(): Promise<Class<any>> {
        if (!this._class) {
            let module = await import(this.classIOR.href);
            //TODO Add named Export
            this._class = module[this.name];
            if (!this._class) throw new Error("Fail to load Class")
        }
        return this._class;
    }

    add(object: InterfaceDescriptorInterface): ClassDescriptorInterface {
        if ("extends" in object) {
            this._interfaces.push(object);
            object.addImplementation(this);

        }
        return this;
    }

    registerAllInterfaces(): void {
        const allInterfaces = this.implementedInterfaces;
        for (const aInterface of allInterfaces) {
            aInterface.addImplementation(this);
        }
    }

    get implementedInterfaces(): InterfaceDescriptorInterface[] {
        return this._getImplementedInterfaces();
    }

    _getImplementedInterfaces(interfaceList: InterfaceDescriptorInterface[] = []): InterfaceDescriptorInterface[] {

        for (let i = 0; i < this._interfaces.length; i++) {
            let object = this._interfaces[i];
            if ("pathName" in object) {
                let loadedObject = ONCE.rootNamespace.search(object);
                if (loadedObject && "getImplementations" in loadedObject) {
                    this._interfaces[i] = loadedObject;
                }
            }
        }
        for (const aInterfaceDescriptor of this._interfaces) {
            if ("IOR" in aInterfaceDescriptor && !interfaceList.includes(aInterfaceDescriptor)) {
                aInterfaceDescriptor._getImplementedInterfaces(interfaceList)
            }
        }

        if (this.extends) {
            this.extends._getImplementedInterfaces(interfaceList);
        }

        return interfaceList;
    }
}
