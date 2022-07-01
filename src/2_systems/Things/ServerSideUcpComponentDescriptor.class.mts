// ##IGNORE_TRANSFORMER##

import fs from 'fs';
import path from 'path';
import DefaultUcpComponentDescriptor, { UcpComponentDescriptorInitParameters } from "./DefaultUcpComponentDescriptor.class.mjs";
import { ServerSideUcpComponentDescriptorInterface, UcpComponentDescriptorDataStructure, UcpComponentDescriptorStatics } from "../../3_services/Thing/UcpComponentDescriptor.interface.mjs";
import ClassDescriptorInterface from "../../3_services/Thing/ClassDescriptor.interface.mjs";
import { ThingStatics } from '../../3_services/Thing/Thing.interface.mjs';
import NpmPackage from '../../3_services/NpmPackage.interface.mjs';
import InterfaceDescriptorInterface from '../../3_services/Thing/InterfaceDescriptor.interface.mjs';
import { DefaultNpmPackage } from '../NpmPackage.class.mjs';
import GitRepository from '../../3_services/GitRepository.interface.mjs';
import Submodule from '../../3_services/Submodule.interface.mjs';


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


    let npmPackage = DefaultNpmPackage.getByFolder(path) as NpmPackage;
    if (!npmPackage) throw new Error("Could not find a NPM Package");

    this.npmPackage = npmPackage;
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

  async createExportFile(subModule: Submodule & GitRepository): Promise<void> {

    // TODO@merge move to build process perhaps submodule
    let files = subModule.discoverFiles().filter(f => f.match(/(class|interface)\.mts$/)).sort();

    if (files.length < 1) return;
    let baseDirectory = path.join(subModule.path, 'src');

    let exportList: string[] = [];
    let defaultExport: string = "";
    let fd = fs.openSync(baseDirectory + `/${this.exportFile}`, 'w', 0o666);

    const defaultFile = baseDirectory + "/index.default.mts";
    if (fs.existsSync(defaultFile)) {
      let defaultData = fs.readFileSync(defaultFile).toString();
      fs.writeSync(fd, "// ########## Default Export ##########\n");
      fs.writeSync(fd, defaultData);
      fs.writeSync(fd, "\n// ########## Default Export END ##########\n\n");

    }

    fs.writeSync(fd, "// ########## Generated Export ##########\n");

    let myFile = import.meta.url.replace(/^file:\/\//, '');
    for (const file of files) {

      const fileImport = baseDirectory + file.replace(/\.mts$/, '');
      let moduleFile = path.relative(path.parse(myFile).dir, path.join(subModule.basePath, fileImport));

      moduleFile = moduleFile.match(/^\./) ? moduleFile : "./" + moduleFile;
      let importedModule;
      try {
        let p = import(moduleFile)
        p.catch(e => { console.log(e) });
        importedModule = await p;
      } catch (e) {
        console.log(e)
      }
      if (importedModule) {
        let exportedModuleItems = { ...importedModule };
        for (const itemKey of Object.keys(exportedModuleItems)) {
          let item = exportedModuleItems[itemKey];
          let descriptor: InterfaceDescriptorInterface | ClassDescriptorInterface | undefined;
          if ("allExtendedInterfaces" in item) {
            descriptor = item as InterfaceDescriptorInterface;

          } else if ("classDescriptor" in item && item.classDescriptor) {
            descriptor = item.classDescriptor as ClassDescriptorInterface;
          }

          if (descriptor && descriptor.componentExport && descriptor.componentExportName) {

            let line = "import ";
            line += itemKey === "default" ? descriptor.componentExportName : `{ ${itemKey} } `;
            line += ` from "./${moduleFile}";\n`

            fs.writeSync(fd, line);

            // Import Real Interface
            if ("allExtendedInterfaces" in item) {
              let exportName = this._getInterfaceExportName(baseDirectory + file, item.name);

              let interfaceLine = "import ";
              interfaceLine += exportName === "default" ? item.name : `{ ${exportName} } `;
              interfaceLine += ` from "./${moduleFile}";\n`
              exportList.push(item.name);
              fs.writeSync(fd, interfaceLine);

            }

            if (descriptor.componentExport === "defaultExport") {
              defaultExport = descriptor.componentExportName;
            } else {
              exportList.push(descriptor.componentExportName);
            }

          }
        }
      }
    }


    if (defaultExport) {
      let line = `export default ${defaultExport};\n`
      fs.writeSync(fd, line);
    }
    if (exportList.length > 0) {
      let line = `export {${exportList.join(', ')}};\n`
      fs.writeSync(fd, line);
    }

    fs.writeSync(fd, "// ########## Generated Export END ##########\n");
    fs.closeSync(fd);

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