// ##IGNORE_TRANSFORMER##
import Class from "../../3_services/Class.interface.mjs";
import ClassDescriptorInterface from "../../3_services/Thing/ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface from "../../3_services/Thing/InterfaceDescriptor.interface.mjs";
import UcpComponentDescriptorInterface from "../../3_services/Thing/UcpComponentDescriptor.interface.mjs";
import InterfaceDescriptor from "./InterfaceDescriptor.class.mjs";


const UcpComponentDescriptor = (await import("./BaseUcpComponentDescriptor.class.mjs")).default;

export default class ClassDescriptor implements ClassDescriptorInterface {

    private static _classDescriptorStore = new WeakMap<Class<any>, ClassDescriptorInterface>();
    ucpComponentDescriptor!: UcpComponentDescriptorInterface;
    filename: string | undefined;

    get componentExportName(): string {
        if (!this.name) throw new Error("No name");
        return this.name;
    }

    componentExport: 'defaultExport' | 'namedExport' | undefined;

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

    get name(): string | undefined { return this._class?.name }

    static getClassDescriptor4Class(aClass: Class<any>): ClassDescriptorInterface {
        let descriptor = this._classDescriptorStore.get(aClass);
        if (descriptor === undefined) {
            descriptor = new ClassDescriptor().init(aClass);
            this._classDescriptorStore.set(aClass, descriptor);
        }
        return descriptor;
    }

    /* get allInterfaces(): InterfaceDescriptor[] {
         let result: InterfaceDescriptor[] = [...this._interfaces];
         for (const interfaceObject of this._interfaces) {
             const extendedInterfaces = interfaceObject.allExtendedInterfaces;
             if (extendedInterfaces.length > 0) result.push(...extendedInterfaces);
         }
         return [...new Set(result)]
     }
     */

    implements(interfaceObject: InterfaceDescriptorInterface) {
        return this.implementedInterfaces.includes(interfaceObject);
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
        return `${this.packagePath}.${this.packageName}[${this.packageVersion}]/${this.className}`
    }

    private _class: Class<any> | undefined;
    private _interfaces: InterfaceDescriptorInterface[] = [];
    private _extends: Class<any>[] = [];
    get extends(): Class<any>[] {
        if (!this._class) return [];
        if (this._extends.length == 0) {
            let myClass = this._class;

            // let myPrototype = myClass.prototype;
            // let myType = Object.getPrototypeOf(myClass);

            while (Object.getPrototypeOf(myClass)) {
                myClass = Object.getPrototypeOf(myClass);
                this._extends.push(myClass);
            }

            // //@ts-ignore
            // while (myClass.__proto__) {
            //     //@ts-ignore
            //     myClass = myClass.__proto__;
            //     this._extends.push(myClass);
            // }
        }
        return this._extends;
    };

    get class(): any { // TODO Missing Type
        return this._class
    }

    get className(): string {
        if (!this._class) throw new Error("Missing class in Descriptor")
        return this._class.name;
    }

    init(aClass: Class<any>): this {
        this._class = aClass;
        return this;
    }

    add(object: InterfaceDescriptorInterface | UcpComponentDescriptorInterface): ClassDescriptorInterface {
        if ("extends" in object) {
            this._interfaces.push(object);
            object.addImplementation(this);
        } else {
            this.ucpComponentDescriptor = object;
        }

        return this;
    }

    static register(packagePath: string, packageName: string, packageVersion: string | undefined): Function {
        return (aClass: any, name: string, x: any): void => {
            let classDescriptor = aClass.classDescriptor as ClassDescriptorInterface | undefined;
            if (classDescriptor !== undefined) {
                classDescriptor.register(packagePath, packageName, packageVersion);
            }
        }
    }

    register(packagePath: string, packageName: string, packageVersion: string | undefined): void {
        let ucpComponentDescriptor = UcpComponentDescriptor.getDescriptor(packagePath, packageName, packageVersion);
        ucpComponentDescriptor.register(this.class);
        this.registerAllInterfaces();
    }

    private registerAllInterfaces(): void {
        const allInterfaces = this.implementedInterfaces;
        for (const aInterface of allInterfaces) {
            aInterface.addImplementation(this);
        }
    }

    get implementedInterfaces(): InterfaceDescriptorInterface[] {
        return this._getImplementedInterfaces();
    }

    _getImplementedInterfaces(interfaceList: InterfaceDescriptorInterface[] = []): InterfaceDescriptorInterface[] {

        // const add = (aInterfaceDescriptor: InterfaceDescriptorInterface) => {
        //     if (!interfaceList.includes(aInterfaceDescriptor)) {
        //         interfaceList = [...interfaceList, ...aInterfaceDescriptor._getImplementedInterfaces(interfaceList)]
        //     }
        // }

        for (const aInterfaceDescriptor of this._interfaces) {
            if (!interfaceList.includes(aInterfaceDescriptor)) {
                aInterfaceDescriptor._getImplementedInterfaces(interfaceList)
            }
        }


        //@ts-ignore
        if (this.extends[0] && this.extends[0]?.classDescriptor) {
            //@ts-ignore
            const classDescriptor = this.extends[0]?.classDescriptor as ClassDescriptorInterface;

            classDescriptor._getImplementedInterfaces(interfaceList);
        }

        return interfaceList;
    }



    static addInterfaces(packagePath: string, packageName: string, packageVersion: string | undefined, interfaceName: string): Function {
        return (aClass: any, name: string, x: any): void => {
            let classDescriptor = aClass.classDescriptor as ClassDescriptorInterface | undefined;
            if (classDescriptor !== undefined) {
                classDescriptor.addInterfaces(packagePath, packageName, packageVersion, interfaceName);
            }
        }
    }

    addInterfaces(packagePath: string, packageName: string, packageVersion: string | undefined, interfaceName: string): this {
        let interfaceDescriptor = InterfaceDescriptor.register(packagePath, packageName, packageVersion, interfaceName);
        this.add(interfaceDescriptor);
        return this;
    }

    static setFilePath(filename: string): Function {
        return (aClass: any, name: string, x: any): void => {
            let classDescriptor = aClass.classDescriptor as ClassDescriptorInterface | undefined;
            if (classDescriptor !== undefined) {
                classDescriptor.setFilePath(filename);
            }
        }

    }

    setFilePath(filename: string) {
        this.filename = filename;
    }

    // Adds Object to export list
    static componentExport(exportType: 'defaultExport' | 'namedExport'): Function {
        return (aClass: any, name: string, x: any): void => {
            (aClass.classDescriptor as ClassDescriptorInterface).componentExport = exportType;
        }
    }

}



