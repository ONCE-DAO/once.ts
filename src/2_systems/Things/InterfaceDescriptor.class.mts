// ##IGNORE_TRANSFORMER##
import ClassDescriptorInterface from "../../3_services/Thing/ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface, { InterfaceDescriptorStatics } from "../../3_services/Thing/InterfaceDescriptor.interface.mjs";
import UcpComponentDescriptorInterface from "../../3_services/Thing/UcpComponentDescriptor.interface.mjs";
import UcpComponentDescriptor from "./BaseUcpComponentDescriptor.class.mjs";

let NewInterfaceDescriptor = class InterfaceDescriptor implements InterfaceDescriptorInterface {
    public readonly name: string;

    id: string = Math.round(Math.random() * 10000000) + '';

    readonly extends: InterfaceDescriptorInterface[] = [];
    readonly implementations: ClassDescriptorInterface<any>[] = [];
    private static _lastDescriptor: InterfaceDescriptorInterface;
    public ucpComponentDescriptor!: UcpComponentDescriptorInterface;
    public filename: string = "Missing";
    _componentExport: 'namedExport' | 'defaultExport' | undefined;

    static get lastDescriptor(): InterfaceDescriptorInterface {
        if (!this._lastDescriptor) throw new Error("Missing last Descriptor. Check TS transform Script")
        return this._lastDescriptor;
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
                (interfaceObject as InterfaceDescriptor)._getImplementedInterfaces(interfaceList);
            }
        }
        return interfaceList;
    }

    addImplementation(classDescriptor: ClassDescriptorInterface<any>): this {
        this.implementations.push(classDescriptor);
        return this
    }


    addExtension(packagePath: string, packageName: string, packageVersion: string | undefined, interfaceName: string): InterfaceDescriptorInterface {
        let ucpComponentDescriptor = UcpComponentDescriptor.getDescriptor(packagePath, packageName, packageVersion);
        let interfaceDesc = ucpComponentDescriptor.getUnitByName(interfaceName, 'InterfaceDescriptor')
        if (interfaceDesc === undefined) {
            interfaceDesc = new InterfaceDescriptor(ucpComponentDescriptor, interfaceName);
        }

        this.add(interfaceDesc);
        return this;
    }

    add(object: InterfaceDescriptorInterface | UcpComponentDescriptorInterface): this {
        if (object instanceof InterfaceDescriptor) {
            this.extends.push(object)
        } else if ("writeToPath" in object) {
            this.ucpComponentDescriptor = object;
        }
        return this;
    }

    static register(packagePath: string, packageName: string, packageVersion: string | undefined, interfaceName: string): InterfaceDescriptorInterface {
        let ucpComponentDescriptor = UcpComponentDescriptor.getDescriptor(packagePath, packageName, packageVersion);

        let interfaceDesc = ucpComponentDescriptor.getUnitByName(interfaceName, 'InterfaceDescriptor')
        if (interfaceDesc) {
            this._lastDescriptor = interfaceDesc;
            return interfaceDesc;
        }

        interfaceDesc = new this(ucpComponentDescriptor, interfaceName);
        this._lastDescriptor = interfaceDesc;
        return interfaceDesc;
    }

    constructor(ucpComponentDescriptor: UcpComponentDescriptorInterface, interfaceName: string) {
        this.name = interfaceName;
        ucpComponentDescriptor.register(this);
        //console.log(`New InterfaceDescriptor: ${this.name} ${this.id}`);
        return this;
    }
}

let InterfaceDescriptor: InterfaceDescriptorStatics = NewInterfaceDescriptor;
// declare global {
//     var CashInterfaceDescriptor: InterfaceDescriptorStatics | undefined;
// }

// if (typeof global.CashInterfaceDescriptor === "undefined") {
//     global.CashInterfaceDescriptor = NewInterfaceDescriptor;
// } else {
//     InterfaceDescriptor = global.CashInterfaceDescriptor;
// }


export default InterfaceDescriptor;