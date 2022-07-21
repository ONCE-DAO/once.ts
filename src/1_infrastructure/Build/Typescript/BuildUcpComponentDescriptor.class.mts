import { writeFileSync } from "fs";
import ts from "typescript";
import DefaultUcpDependency from "../../../2_systems/UCP/DefaultUcpDependency.mjs";
import DefaultUcpInterface from "../../../2_systems/UCP/DefaultUcpInterface.class.mjs";
import DefaultUcpUnit from "../../../2_systems/UCP/DefaultUcpUnit.class.mjs";
import ExportUcpComponentDescriptor from "../../../2_systems/UCP/ExportUcpComponentDescriptor.mjs";
import NpmPackageInterface from "../../../3_services/Build/Npm/NpmPackage.interface.mjs";
import BuildUcpComponentDescriptorInterface from "../../../3_services/Build/Typescript/ExportUcpComponentDescriptor.interface.mjs";
import UcpComponentDescriptorExportInterface from "../../../3_services/UCP/UcpComponentDescriptor.interface.mjs";
import UcpDependency, { UcpDependencyType } from "../../../3_services/UCP/UcpDependency.interface.mjs";
import UcpInterfaceObject from "../../../3_services/UCP/UcpInterface.class.mjs";
import { UnitType } from "../../../3_services/UCP/UcpUnit.interface.mjs";

export default class BuildUcpComponentDescriptor extends ExportUcpComponentDescriptor implements BuildUcpComponentDescriptorInterface {
    constructor(descriptor: UcpComponentDescriptorExportInterface) {
        super(descriptor);
    }

    importFile(filename: string): void {
        // Parse existing Component Descriptor
        if (ts.sys.fileExists(filename)) {
            let rawString = ts.sys.readFile(filename)?.toString();
            if (rawString) {
                const parsedData = JSON.parse(rawString);
                if (parsedData?.interfaceList)
                    this.interfaceList = [...new Set([...this.interfaceList, ...(parsedData.interfaceList as UcpInterfaceObject[]).map(x => new DefaultUcpInterface(x.type, x.name, x.unitDefaultExport, x.unitName))])]

                if (parsedData?.dependencyList)
                    this.dependencyList = [...new Set([...this.dependencyList, ...(parsedData.dependencyList as UcpDependency[]).map(x => new DefaultUcpDependency(x.type, x.name, x.reference))])];
            }
        }

    }

    addNpmPackageInfos(npmPackage: NpmPackageInterface): void {
        if (npmPackage.packageJson.dependencies) {
            this.dependencyList = [...new Set([...this.dependencyList, ...Object.entries(npmPackage.packageJson.dependencies).map(x => new DefaultUcpDependency(UcpDependencyType.npm, x[0], x[1]))])]
        }
    }

    addUnitFiles(files: string[]): void {
        this.units = [...new Set([...this.units, ...files.map(path => new DefaultUcpUnit(UnitType.File, path))])]
    }

    writeComponentDescriptor(filename: string): void {
        writeFileSync(filename, JSON.stringify(this, null, 2));
    }
}