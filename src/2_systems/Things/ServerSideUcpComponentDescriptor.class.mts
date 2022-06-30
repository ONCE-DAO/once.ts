// ##IGNORE_TRANSFORMER##

import fs from 'fs';
import path from 'path';
import DefaultUcpComponentDescriptor, { UcpComponentDescriptorInitParameters } from "./DefaultUcpComponentDescriptor.class.mjs";
import { ServerSideUcpComponentDescriptorInterface, UcpComponentDescriptorDataStructure, UcpComponentDescriptorStatics } from "../../3_services/Thing/UcpComponentDescriptor.interface.mjs";
import ClassDescriptorInterface from "../../3_services/Thing/ClassDescriptor.interface.mjs";
import { ThingStatics } from '../../3_services/Thing/Thing.interface.mjs';
import InterfaceDescriptorInterface from '../../3_services/Thing/InterfaceDescriptor.interface.mjs';


const NewServerSideUcpComponentDescriptor = class ServerSideUcpComponentDescriptor extends DefaultUcpComponentDescriptor implements ServerSideUcpComponentDescriptorInterface {

  exportFile: string = "index.ts";

  protected myClass = ServerSideUcpComponentDescriptor;


  // HACK Keine ahnung warum er das ! nicht akzeptiert
  // @ts-ignore
  npmPackage!: NpmPackage;

  init({ path, relativePath }: UcpComponentDescriptorInitParameters) {
    (this.relativeSrcPath = relativePath);

    // TODO Deaktiviert wegen Browser
    //this.identifier = basename(relativePath);


    // this.name = npmPackage?.name;
    // this.version = npmPackage?.version;
    return this;
  }

  writeToDistPath() {
    try {
      // TODO@MERGE write descriptor to dist
      // const outDir = this.npmPackage.tsConfig?.compilerOptions?.outDir;
      // if (!outDir) throw new Error("Missing outDir in tsconfig.json");
      // const filePath = path.join(this.npmPackage.basePath, outDir);
      // this.writeToPath(filePath);
    } catch (err) {
      console.error("Filed to write ComponentDescriptor for component " + this.name);
      throw err;
    }
  }

  // HACK Need better source
  get scenarioDirectory(): string {
    if (!this.npmPackage.path) throw new Error("missing path");
    return path.join(...this.npmPackage.path.split('.'), this.npmPackage.name, this.npmPackage.version || 'latest')
  }

  get descriptorFileName() { return 'ComponentDescriptor.json' }

  writeToPath(writePath: string): void {

    let outputData: UcpComponentDescriptorDataStructure = {
      name: this.name,
      version: this.version,
      package: this.package
    }

    let filePath = path.join(writePath, this.descriptorFileName)
    let dataString = JSON.stringify(outputData, null, 2)
    fs.writeFileSync(filePath, dataString);
    // const descriptor = create();
    // descriptor.ele("", "foo").txt("vbhjk").up();
    // // Object.keys(this).forEach((key, i) => {
    // //   //@ts-ignore
    // //   const value = this[key];
    // //   // value && console.log(value.toString());
    // //   descriptor.ele("", key).txt(value.toString()).up();
    // //   // value && descriptor.att(key, value.toString())
    // // });
    // // const xml = descriptor.end({ prettyPrint: true });
    // // console.log("DESCRIPTOR", xml);
    // writeFileSync(
    //   join(path, version, this.fileName),
    //   descriptor.end({ prettyPrint: true })
    // );
  }

  get defaultExportObject(): ThingStatics<any> | InterfaceDescriptorInterface | undefined {
    let result = this.units.filter(unit => {
      if ("classDescriptor" in unit) {
        return unit.classDescriptor.componentExport === "defaultExport"
      } else if (unit) {
        return unit.componentExport === "defaultExport"
      }
    });
    return result?.[0];
  }

  private _getInterfaceExportName(fileName: string, interfaceName: string, fileData?: string): string {
    if (!fileData) {
      if (!fs.existsSync(fileName)) {
        throw new Error(`File '${fileName}' doesn't exist`);
      }

      fileData = fs.readFileSync(fileName).toString();
    }

    let regex = new RegExp(`export (default)? ?(interface )?({[^}*])?${interfaceName}`, "m");
    let matchResult = fileData.match(regex);
    if (matchResult) {
      if (matchResult[1] === "default") {
        return "default";
      } else {
        return interfaceName;
      }
    }
    throw new Error(`Could not find the interface ${interfaceName} in file '${fileName}'`);

  }


  static readFromFile(path: string) {
    return JSON.parse(fs.readFileSync(path).toString());
  }

  get fileName() {
    return `${this.name}.${this.version
      ?.replace(/\./g, "_")
      .replace("/", "-")}.component.xml`;
  }


}


let ServerSideUcpComponentDescriptor: UcpComponentDescriptorStatics = NewServerSideUcpComponentDescriptor;
// declare global {
//   var CashServerSideUcpComponentDescriptor: UcpComponentDescriptorStatics | undefined;
// }

// if (typeof global.CashServerSideUcpComponentDescriptor === "undefined") {
//   global.CashServerSideUcpComponentDescriptor = NewServerSideUcpComponentDescriptor;
// } else {
//   ServerSideUcpComponentDescriptor = global.CashServerSideUcpComponentDescriptor;
// }

export default ServerSideUcpComponentDescriptor;