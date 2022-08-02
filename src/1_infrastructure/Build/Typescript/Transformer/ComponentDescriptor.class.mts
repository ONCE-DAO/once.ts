// ##IGNORE_TRANSFORMER##

import TS from 'typescript';
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import path, { relative } from "path";
import { exportType, VisitorContext } from './Transformer.interface.mjs';
import DeclarationDescriptor from './DeclarationDescriptor.class.mjs';
import BaseDescriptorTR from './BaseDescriptorTR.class.mjs';
import ComponentDescriptorExportFormat from './interfaces2Move/ComponentDescriptorTransformer.interface.mjs';

export class Dependency {
    type: 'IOR' = 'IOR'
    constructor(public name: string, public reference: string) { }
};

export default class ComponentDescriptorTR extends BaseDescriptorTR implements ComponentDescriptorExportFormat {
    descriptors: BaseDescriptorTR[] = [];
    type: 'ComponentDescriptor' = 'ComponentDescriptor';
    private static _store: Record<string, ComponentDescriptorTR> = {};
    package: string;
    name: string;
    version: string;
    packagePath!: string;
    private exportUpdates: boolean = false;
    dependency: Dependency[] = [];
    static instanceStore: ComponentDescriptorTR[] = [];

    get exportReference(): ComponentDescriptorExportFormat {
        return {
            type: this.type,
            name: this.name,
            version: this.version,
            packagePath: this.scenarioLocation
        }
    }

    addDescriptor(descriptor: BaseDescriptorTR) {
        this.descriptors.push(descriptor);
    }

    get scenarioLocation(): string {
        let compilerOptions = this.visitorContext.program.getCompilerOptions();
        if (!compilerOptions.baseUrl)
            throw new Error("Missing compiler option 'baseUrl'");

        return relative(compilerOptions.baseUrl, this.outDir);
    }

    get outDir(): string {
        //HACK
        if (this.packagePath.match('/Scenarios/')) return this.packagePath;
        let matchResult = this.packagePath.match(/\/Components\/(.+\/)[^\/]+@(.+)$/);
        if (!matchResult)
            throw new Error("Fail to Match ! Fix HACK")

        return path.join(ONCE.eamd.currentScenario.scenarioPath, matchResult[1], matchResult[2])
        // let compilerOptions = this.visitorContext.program.getCompilerOptions();
        // if (!compilerOptions.outDir)
        //     throw new Error("Missing compiler option 'outDir'");

        // return compilerOptions.outDir;
    }

    get exportFilePath(): string {
        return path.join(this.outDir, this.name + '.component.json');
    }

    get rootDir(): string {
        let compilerOptions = this.visitorContext.program.getCompilerOptions();
        if (!compilerOptions.rootDir)
            throw new Error("Missing compiler option 'rootDir'");
        return compilerOptions.rootDir;
    }

    addIORDependency(iorString: string): void {
        if (this.dependency.filter(x => x.reference === iorString).length)
            return;
        let dependency = new Dependency(iorString.replace(/.*\/(.+)\[.*/, '$1'), iorString);
        this.dependency.push(dependency);
        this.exportUpdates = true;
    }

    exports: { file: TS.SourceFile; identifier: TS.Identifier; }[] = [];

    addExport(file: TS.SourceFile, identifier: TS.Identifier): void {
        // ignore the export File
        if (file.fileName.match(/index\.export\.[mc]?[jt]s/))
            return;
        if (this.exports.filter(x => x.identifier.text === identifier.text && x.file.fileName == file.fileName).length)
            return;
        this.exports.push({ file, identifier });
        this.exportUpdates = true;
        // console.log("Add Export " + this.packagePath, ' ', file.fileName, ' ', identifier.text)
    }

    private formatExports(): InterfaceObject[] {
        let data: InterfaceObject[] = [];
        for (let element of this.exports) {
            let exportName = element.identifier.text;
            let unitDefaultExport: boolean = false;
            if (element.identifier.parent.modifiers)
                unitDefaultExport = element.identifier.parent.modifiers.filter(x => x.kind === TS.SyntaxKind.DefaultKeyword).length === 1;

            let type = this.getKindName4Node(element.identifier.parent, element.identifier);
            let relativePath = path.relative(this.rootDir, element.file.fileName);
            let unitName = relativePath.replace(/ts$/, 'js');
            let interfaceObject: InterfaceObject = { type, name: exportName, unitDefaultExport, unitName };

            data.push(interfaceObject);
        }

        return data;
    }

    getKindName4Node(node: TS.Node, identifier: TS.Identifier): exportType {

        if (TS.isClassDeclaration(node))
            return "TypescriptClass";
        if (TS.isInterfaceDeclaration(node))
            return "TypescriptInterface";
        if (TS.isEnumDeclaration(node))
            return "TypescriptEnum";
        if (TS.isTypeAliasDeclaration(node))
            return "TypescriptType";


        let dd = new DeclarationDescriptor(identifier, this.visitorContext);
        if (dd.name === DeclarationDescriptor.MISSING_DECLARATION)
            return "unknown";

        throw new Error("Not implemented yet");
    }

    write2File() {
        if (!this.exportUpdates)
            return;
        let interfaceList = this.formatExports();
        let currentData: any = {};
        if (existsSync(this.exportFilePath)) {
            currentData = JSON.parse(readFileSync(this.exportFilePath, 'utf8').toString());
        }
        //if (currentData.interfaceList) data = [...data, ...currentData.interfaceList]
        currentData.interfaceList = interfaceList;
        currentData.dependencyList = this.dependency;
        writeFileSync(this.exportFilePath, JSON.stringify(currentData, null, 2));
        this.exportUpdates = false;
        this.writeAllDescriptors();
    }

    writeAllDescriptors(): void {
        for (const descriptor of this.descriptors) {
            descriptor.write2File();
        }
    }

    static writeAllComponentDescriptors() {
        for (const descriptor of this.instanceStore) {
            descriptor.write2File();
        }
    }


    static getComponentDescriptor(object: TS.SourceFile | string | TS.Node, visitorContext: VisitorContext): ComponentDescriptorTR {
        let filename: string;
        if (typeof object === 'string') {
            filename = object;
        } else if (TS.isSourceFile(object)) {
            filename = object.fileName;
        } else {
            filename = this.getFile4NodeObject(object).fileName;
        }

        let packageFile = this.getPackage4File(path.dirname(filename).split('/'), filename);

        if (this._store[packageFile]) {
            return this._store[packageFile];
        } else {
            const componentDescriptor = new ComponentDescriptorTR(visitorContext, packageFile);
            this._store[packageFile] = componentDescriptor;
            return componentDescriptor;
        }

    }

    static UNKNOWN_NAME = "Unknown name";
    static UNKNOWN_VERSION = "Unknown version";
    static UNKNOWN_PACKAGE = "Unknown package";

    constructor(visitorContext: VisitorContext, packageJson?: string) {
        super(visitorContext);
        if (!packageJson) {
            this.package = ComponentDescriptorTR.UNKNOWN_PACKAGE;
            this.name = ComponentDescriptorTR.UNKNOWN_NAME;
            this.version = ComponentDescriptorTR.UNKNOWN_VERSION;
            return this;
        }
        const packageJsonData = JSON.parse(readFileSync(packageJson).toString());

        let path = packageJson.split('/');
        path.pop();
        this.packagePath = path.join('/');

        for (const key of ["namespace", "name", "version"]) {
            if (packageJsonData[key] === undefined) {
                throw new Error(`Missing ${key} in the Package Json file => ${packageJson}`);
            }
        }
        this.package = packageJsonData.namespace;
        this.name = packageJsonData.name;
        this.version = packageJsonData.version;

        ComponentDescriptorTR.instanceStore.push(this)
        return this;
    }


    static getPackage4File(pathArray: string[], originalFilename: string): string {
        //if (debug) console.log("Get package 4 Path " + path);
        if (pathArray.length === 1)
            throw new Error("Could not find a *.component.json File! " + originalFilename);

        let nodeModulesIndex = pathArray.indexOf('node_modules');
        if (nodeModulesIndex > -1)
            pathArray = pathArray.splice(0, nodeModulesIndex);

        let currentPath = pathArray.join('/');
        let files = readdirSync(currentPath);
        let componentsFile = files.filter(x => x.match(/\.component.json$/));
        if (componentsFile.length > 0) {
            return path.join(currentPath, componentsFile[0]);
        }

        const packageFile = path.join(currentPath, 'package.json');
        if (existsSync(packageFile)) {
            return packageFile;
        }

        pathArray.pop();
        return this.getPackage4File(pathArray, originalFilename);

    }

    static getFile4NodeObject(object: TS.Node): TS.SourceFile {
        if (TS.isSourceFile(object)) {
            return object;
        } else if (object.parent) {
            return this.getFile4NodeObject(object.parent);
        } else {
            throw new Error("Missing Parent")
        }
    }
}



export interface InterfaceObject {
    type: exportType,
    name: string,
    unitDefaultExport: boolean,
    unitName: string
}