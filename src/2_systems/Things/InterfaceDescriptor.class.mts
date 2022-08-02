// ##IGNORE_TRANSFORMER##
import DeclarationDescriptor from "../../1_infrastructure/Build/Typescript/Transformer/DeclarationDescriptor.class.mjs";
import Class from "../../3_services/Class.interface.mjs";
import IOR from "../../3_services/IOR.interface.mjs";
import { NamespaceParent } from "../../3_services/Namespace/Namespace.interface.mjs";
import ClassDescriptorInterface from "../../3_services/Thing/ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface, { InterfaceDescriptorFileFormat } from "../../3_services/Thing/InterfaceDescriptor.interface.mjs";
import UcpComponentDescriptorInterface from "../../3_services/Thing/UcpComponentDescriptor.interface.mjs";
import { urlProtocol } from "../../3_services/Url.interface.mjs";
import DefaultIOR from "../NewThings/DefaultIOR.class.mjs";
import InterfaceDescriptorHandler from "./InterfaceDescriptorHandler.class.mjs";

export default class InterfaceDescriptor implements InterfaceDescriptorInterface {

    private _IOR: IOR | undefined;

    get IOR(): IOR {
        if (!this._IOR) {
            this._IOR = new DefaultIOR().init('ior:meta:/' + this.location.join('/'));
        }
        return this._IOR;
    }

    static get IOR(): IOR {
        // HACK with hardcoded IOR
        return new DefaultIOR().init('ior:esm:/tla/EAM/Once/once[build]/InterfaceDescriptor');
    }
    classDescriptor = { IOR: InterfaceDescriptor.IOR };


    public get location(): string[] {
        if (!this._parent && this.name === "") return [];
        let parentLocation = this.parent.location;
        parentLocation.push(this.name);
        return parentLocation;
    }

    get locationString(): string {
        return this.location.join('.');
    }

    get name(): string {
        if (!this._name) throw new Error("Missing name. Please init");
        return this._name
    }

    private _name: string | undefined;


    protected _parent: NamespaceParent | undefined = undefined;
    get parent(): NamespaceParent {
        if (!this._parent)
            throw new Error("Missing parent")
        return this._parent
    }

    set parent(value: NamespaceParent) {
        this._parent = value
    }

    init(declarationDescriptor: DeclarationDescriptor): this {
        this._name = declarationDescriptor.name;
        ONCE.rootNamespace.add(this, declarationDescriptor.packageAndLocation);
        return this;
    }


    export(): InterfaceDescriptorFileFormat {
        return {
            name: this.name,
            extends: this.extends.map(i => i.IOR.href),
            //classIOR: this.classIOR.href,
            // componentExport: this.componentExport
        }
    }

    import(data: InterfaceDescriptorFileFormat): void {
        this._name = data.name;
        //this._classIOR = new DefaultIOR().init(data.classIOR);
        this.extends = data.extends.map(i => ONCE.rootNamespace.search(new DefaultIOR().init(i)) as InterfaceDescriptorInterface);
    }


    id: string = Math.round(Math.random() * 10000000) + '';

    extends: InterfaceDescriptorInterface[] = [];
    private readonly _implementations: ClassDescriptorInterface<any>[] = [];
    public ucpComponentDescriptor!: UcpComponentDescriptorInterface;
    _componentExport: 'namedExport' | 'defaultExport' | undefined = 'namedExport';

    get implementations(): Class<any>[] {
        return this._implementations.map(x => x.class)
    }

    get componentExportName(): string {
        return this.name + 'ID';
    }

    get packagePath(): string {
        if (!this.ucpComponentDescriptor?.srcPath) throw new Error("Missing srcPath in ucpComponentDescriptor");
        return this.ucpComponentDescriptor.srcPath;
    }
    get packageName(): string {
        if (!this.ucpComponentDescriptor?.name) throw new Error("Missing name in ucpComponentDescriptor");
        return this.ucpComponentDescriptor.name;
    }

    get packageVersion(): string {
        if (!this.ucpComponentDescriptor?.version) throw new Error("Missing version in ucpComponentDescriptor");
        return this.ucpComponentDescriptor.version;
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

    get componentExport(): 'namedExport' | 'defaultExport' | undefined { return this._componentExport }
    set componentExport(value: 'namedExport' | 'defaultExport' | undefined) { this._componentExport = value; }

    _getImplementedInterfaces(interfaceList: InterfaceDescriptorInterface[] = []): InterfaceDescriptorInterface[] {
        if (!interfaceList.includes(this)) {
            interfaceList.push(this);
            for (const interfaceObject of this.extends) {
                interfaceObject._getImplementedInterfaces(interfaceList);
            }
        }
        return interfaceList;
    }

    addImplementation(classDescriptor: ClassDescriptorInterface<any>): InterfaceDescriptorInterface {
        this._implementations.push(classDescriptor);
        return this
    }


    add(object: InterfaceDescriptorInterface | UcpComponentDescriptorInterface): this {
        if (object instanceof InterfaceDescriptor) {
            this.extends.push(object)
        } else if ("writeToPath" in object) {
            this.ucpComponentDescriptor = object;
        }
        return this;
    }


    constructor() {
        return this;
    }


}
