// ##IGNORE_TRANSFORMER##
import DeclarationDescriptor from "../../1_infrastructure/Build/Typescript/Transformer/DeclarationDescriptor.class.mjs";
import Class from "../../3_services/Class.interface.mjs";
import IOR from "../../3_services/IOR.interface.mjs";
import { NamespaceParent } from "../../3_services/Namespace/Namespace.interface.mjs";
import VersionFolder from "../../3_services/Namespace/VersionFolder.interface.mjs";
import ClassDescriptorInterface, { ClassDescriptorFileFormat } from "../../3_services/Thing/ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface from "../../3_services/Thing/InterfaceDescriptor.interface.mjs";
import Thing from "../../3_services/Thing/Thing.interface.mjs";
import UcpComponentDescriptorInterface from "../../3_services/Thing/UcpComponentDescriptor.interface.mjs";
import { urlProtocol } from "../../3_services/Url.interface.mjs";
import DefaultIOR from "../NewThings/DefaultIOR.class.mjs";
import InterfaceDescriptorHandler from "./InterfaceDescriptorHandler.class.mjs";


export default class ClassDescriptor<ClassType extends Class<any>> implements ClassDescriptorInterface<ClassType> {
    private _classIOR: IOR | undefined;

    get IOR(): IOR {
        if (!this._IOR) {
            this._IOR = new DefaultIOR().init('ior:meta:/' + this.location.join('/'));
        }
        return this._IOR;
    }

    static get IOR(): IOR {
        // HACK with hardcoded IOR
        return new DefaultIOR().init('ior:esm:/tla/EAM/Once/once[build]/ClassDescriptor');
    }
    classDescriptor = { IOR: ClassDescriptor.IOR };


    private _name: string | undefined;
    _parent: NamespaceParent | undefined;

    ucpComponentDescriptor!: UcpComponentDescriptorInterface;

    private _filename: string | undefined;
    public get filename(): string {
        if (!this._filename) throw new Error("Missing filename")
        return this._filename;
    }
    public set filename(value: string) {
        this._filename = value;
    }

    componentExport: 'defaultExport' | 'namedExport' = 'namedExport';
    private _IOR: IOR | undefined;

    get name(): string {
        if (!this._name) throw new Error("Missing name. Please init");
        return this._name
    }

    get parent(): NamespaceParent {
        if (!this._parent) throw new Error("Missing parent")
        return this._parent
    }

    set parent(value: NamespaceParent) {
        this._parent = value
    }

    get location(): string[] {
        return [...this.parent.location, this.name]
    }

    get locationString(): string {
        return this.location.join('.');
    }

    export(): ClassDescriptorFileFormat {
        return {
            name: this.name,
            interfaces: this._interfaces.map(i => "IOR" in i ? i.IOR.href : i.href),
            //classFile: this.filename,
            extends: this.extends?.IOR?.href,
            // classIOR: this.classIOR.href,
            componentExport: this.componentExport
        }
    }

    import(data: ClassDescriptorFileFormat): void {
        this._name = data.name;
        if (data.extends)
            this._extends = new DefaultIOR().init(data.extends);
        //this._classIOR = new DefaultIOR().init(data.classIOR);
        this.componentExport = data.componentExport;

        // if (data.interfaces)
        this._interfaces = data.interfaces.map(i => new DefaultIOR().init(i));
    }

    init(declarationDescriptor: DeclarationDescriptor): this {
        this._name = declarationDescriptor.name;
        ONCE.rootNamespace.add(this, declarationDescriptor.packageAndLocation);
        this.filename = declarationDescriptor.path;
        let heritageClassIOR = declarationDescriptor.heritageClassDescriptorIOR();
        if (heritageClassIOR) {
            let loadedObject = ONCE.rootNamespace.search(heritageClassIOR);
            if (loadedObject && "implements" in loadedObject) {
                this._extends = loadedObject;
            }
        }
        return this;
    }

    get componentExportName(): string {
        if (!this.name) throw new Error("No name");
        return this.name;
    }

    get version(): VersionFolder {
        throw new Error("Not implemented");
        // let version = this.parent.getParentInstanceType(DefaultVersion)
        // if (version == undefined) throw new Error("Can not find version")
        // return version;
    }

    get classIOR(): IOR {
        throw new Error("Not implemented");
        // if (!this._classIOR) {
        //     let href = `ior:esm:${this.packagePath}.${this.packageName}[${this.version}]/${this.name}`
        //     this._classIOR = new DefaultIOR().init(href)
        // }
        // return this.classIOR;
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

    get packageFilename(): string {
        if (this.filename === undefined) throw new Error("Missing Filename")
        let filename = this.filename;
        if (filename.match('/src/')) {
            filename = filename.replace(/.*\/src\//, '');
        } else if (filename.match('/dist/')) {
            filename = filename.replace(/.*\/dist\//, '');
        }
        filename = filename.replace(/(\.js|\.ts)$/, '')
        return filename;
    }

    //TODO Change that to Component export path
    get classPackageString(): string {
        return `${this.version.parent.name}.${this.version.parent.name}[${this.version.name}]/${this.name}`
    }

    private _class!: ClassType;
    private _interfaces: (InterfaceDescriptorInterface | IOR)[] = [];
    private _extends: ClassDescriptorInterface<any> | IOR | undefined;
    get extends(): (ClassDescriptorInterface<any> | undefined) {
        if (this._extends && "href" in this._extends) {
            let loadedObject = ONCE.rootNamespace.search(this._extends);
            if (loadedObject && "implements" in loadedObject) {
                this._extends = loadedObject;
            }
        }
        if (this._extends && "href" in this._extends)
            throw new Error("Fail to load extends IOR: " + this._extends.href)
        return this._extends as ClassDescriptorInterface<any> | undefined;
    };

    get class(): ClassType { // TODO Missing Type
        return this._class
    }

    add(object: InterfaceDescriptorInterface | UcpComponentDescriptorInterface): ClassDescriptorInterface<ClassType> {
        if ("extends" in object) {
            this._interfaces.push(object);
            object.addImplementation(this);
        } else {
            this.ucpComponentDescriptor = object;
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
            if ("href" in object) {
                let loadedObject = ONCE.rootNamespace.search(object);
                if (loadedObject && "implementation" in loadedObject) {
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
