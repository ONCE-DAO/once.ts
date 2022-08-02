import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import Exportable from "../../3_services/Exportable.interface.mjs";
import IOR from "../../3_services/IOR.interface.mjs";
import DefaultNamespace from "../Namespace/DefaultNamespace.class.mjs";
import DefaultIOR from "../NewThings/DefaultIOR.class.mjs";
import ClassDescriptor from "./ClassDescriptor.class.mjs";
import InterfaceDescriptor from "./InterfaceDescriptor.class.mjs";
type ExportableFileType = { typeIOR: string, particle: any }


class OnceInternalPersistenceManagerClass {

    write2File(object: Exportable): void {
        const scenarioPath = ONCE.eamd.currentScenario.scenarioPath;
        let data = object.export();
        const ior = object.IOR;
        const exportData: ExportableFileType = { typeIOR: object.classDescriptor.IOR.href, particle: data }

        const filePath = join(scenarioPath, ior.originPath as string)
        writeFileSync(filePath, JSON.stringify(exportData, null, 2))
    }
    readFromFile(path: string): (ClassDescriptor<any> | InterfaceDescriptor | DefaultNamespace)
    readFromFile(ior: IOR): (ClassDescriptor<any> | InterfaceDescriptor | DefaultNamespace)
    readFromFile(arg1: IOR | string): (ClassDescriptor<any> | InterfaceDescriptor | DefaultNamespace) {
        const scenarioPath = ONCE.eamd.currentScenario.scenarioPath;
        const filePath = join(scenarioPath, (typeof arg1 == "string" ? arg1 : arg1.package as string))

        if (!existsSync(filePath)) throw new Error(`fail to load the file ${filePath}`)

        let stringData = readFileSync(filePath).toString();
        let data = JSON.parse(stringData) as ExportableFileType;
        let objectClass = this.getClass4IOR(new DefaultIOR().init(data.typeIOR));
        let instance = new objectClass();
        instance.import(data.particle)
        return instance;
    }

    // This function make the loading sync as async is not possible
    private getClass4IOR(ior: IOR): typeof ClassDescriptor | typeof InterfaceDescriptor | typeof DefaultNamespace {
        let className = ior.href.split('/').pop();
        switch (className) {
            case "ClassDescriptor":
                return ClassDescriptor;
            case "InterfaceDescriptor":
                return InterfaceDescriptor;
            case "DefaultNamespace":
                return DefaultNamespace;
        }

        throw new Error("Fail to identify: " + ior.href)
    }

    get scenarioPath(): string {
        return ONCE.eamd.currentScenario.scenarioPath;
    }

    loadFilesInFolder(dirPath: string, filePostFix: string | RegExp): (ClassDescriptor<any> | InterfaceDescriptor | DefaultNamespace)[] {
        let files = this._discoverFiles(join(this.scenarioPath, dirPath), filePostFix);
        return files.map(f => this.readFromFile(join(dirPath, f)))
    }

    loadFoldersInFolder(dirPath: string, directoryPostFix: string | RegExp): (ClassDescriptor<any> | InterfaceDescriptor | DefaultNamespace)[] {
        let files = this._discoverFolders(join(this.scenarioPath, dirPath), directoryPostFix);
        return files.map(f => this.readFromFile(join(dirPath, f)))
    }

    private _discoverFolders(dirPath: string, filePostFix: string | RegExp): string[] {
        if (!existsSync(dirPath)) return [];
        let allFiles = readdirSync(dirPath, { withFileTypes: true });
        let directories = allFiles.filter(f => {
            if (!f.isDirectory()) return false;
            if (typeof filePostFix == "string") {
                if (!f.name.endsWith(filePostFix)) return false;
            } else {
                if (f.name.match(filePostFix)) return false;
            }
            if (!existsSync(join(dirPath, f.name, 'object.meta.json'))) return false;
            return true;
        })
        return directories.map(d => join(d.name, 'object.meta.json'));


    }


    private _discoverFiles(dirPath: string, filePostFix: string | RegExp): string[] {
        if (!existsSync(dirPath)) return [];
        let allFiles = readdirSync(dirPath);
        if (typeof filePostFix == "string") {
            return allFiles.filter(x => x.endsWith(filePostFix))
        } else {
            return allFiles.filter(x => x.match(filePostFix))

        }
    }
}

const OnceInternalPersistenceManager = new OnceInternalPersistenceManagerClass();
export default OnceInternalPersistenceManager;