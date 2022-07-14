// ##IGNORE_TRANSFORMER##

import Class from "../../3_services/Class.interface.mjs";
import NpmPackage from "../../3_services/NpmPackage.interface.mjs";
import ClassDescriptorInterface from "../../3_services/Thing/ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface from "../../3_services/Thing/InterfaceDescriptor.interface.mjs";
import { ThingStatics } from "../../3_services/Thing/Thing.interface.mjs";
import UcpComponentDescriptorInterface, { UcpComponentDescriptorStatics } from "../../3_services/Thing/UcpComponentDescriptor.interface.mjs";
import { DefaultNpmPackage } from "./NpmPackage.class.mjs";

export default class DefaultUcpComponentDescriptor implements UcpComponentDescriptorInterface {

  exportFile: string = "index.ts";

  protected static readonly _componentDescriptorStore: { [i: string]: UcpComponentDescriptorInterface } = {};

  // TODO: specify better
  units: (ClassDescriptorInterface<Class<any>> | InterfaceDescriptorInterface)[] = [];

  static getDescriptorName(packagePath: string, packageName: string, packageVersion: string | undefined) {
    return `${packagePath}${packageName}[${packageVersion || 'latest'}]`;
  }

  npmPackage!: NpmPackage;
  relativeSrcPath: string | undefined;
  identifier: string | undefined;

  protected get myClass(): UcpComponentDescriptorStatics {
    //@ts-ignore
    return this.constructor;
  };


  get name(): string {
    if (!this.npmPackage.name) throw new Error("NPM Name is missing for " + this.name);
    return this.npmPackage.name;
  }

  get version(): string {
    if (!this.npmPackage.version) throw new Error("NPM version is missing for " + this.name);
    return this.npmPackage.version;
  }

  get srcPath(): string {
    if (!this.npmPackage.path) throw new Error("NPM path is missing for " + this.name);
    return this.npmPackage.path;
  }

  get package(): string {
    if (!this.npmPackage.namespace) throw new Error("NPM namespace is missing for " + this.name);
    return this.npmPackage.namespace;
  }

  getUnitByName(name: string, type: 'ClassDescriptor'): ClassDescriptorInterface<Class<any>> | undefined;
  getUnitByName(name: string, type: 'InterfaceDescriptor'): InterfaceDescriptorInterface | undefined;
  getUnitByName(name: string, type: 'InterfaceDescriptor' | 'ClassDescriptor'): unknown {

    if (type === 'ClassDescriptor') {
      return this.units.filter(u => {
        if (u.name === name && "class" in u) {
          return u;
        }
      })?.[0]
    }

    if (type === 'InterfaceDescriptor') {
      return this.units.filter(u => {
        if ("allExtendedInterfaces" in u && u.name === name) {
          return u;
        }
      })?.[0]
    }


  }

  init({ path, relativePath }: UcpComponentDescriptorInitParameters) {
    (this.relativeSrcPath = relativePath);

    // TODO Deaktiviert wegen Browser
    throw new Error("To Do");
    //this.identifier = basename(relativePath);


    //@ts-ignore
    let npmPackage = NpmPackage.getByFolder(path);
    if (!npmPackage) throw new Error("Could not find a NPM Package");

    this.npmPackage = npmPackage;
    // this.name = npmPackage?.name;
    // this.version = npmPackage?.version;
    return this;
  }



  get defaultExportObject(): ClassDescriptorInterface<Class<any>> | InterfaceDescriptorInterface | undefined {
    let result = this.units.filter(unit => {
      if ("class" in unit) {
        return unit.componentExport === "defaultExport"
      } else if ("allExtendedInterfaces" in unit) {
        return unit.componentExport === "defaultExport"
      }
    });
    return result?.[0];
  }



  register(object: ClassDescriptorInterface<Class<any>> | InterfaceDescriptorInterface): void {

    if ("class" in object) {
      this.units.push(object);
      object.add(this);

    } else if ("implementedInterfaces" in object) {
      const existingInterfaceDescriptors = this.getUnitByName(object.name, "InterfaceDescriptor");
      if (existingInterfaceDescriptors) {
        throw new Error(`Duplicated Interface '${object.name}' in UcpComponent ${this.name}`);
      }
      this.units.push(object);

      object.add(this);

    }
  }

  static register(packagePath: string, packageName: string, packageVersion: string | undefined): Function {
    return (aClass: any, name: string, x: any): void => {

      const descriptor = this.getDescriptor(packagePath, packageName, packageVersion);
      descriptor.register(aClass);
    }
  }



  static getDescriptor(packagePath: string, packageName: string, packageVersion: string | undefined): UcpComponentDescriptorInterface {
    let name = this.getDescriptorName(packagePath, packageName, packageVersion);
    if (this._componentDescriptorStore[name]) return this._componentDescriptorStore[name];

    return new this().initBasics(packagePath, packageName, packageVersion)
  }

  static registerDescriptor(object: UcpComponentDescriptorInterface, packagePath: string, packageName: string, packageVersion: string | undefined): void {
    let name = this.getDescriptorName(packagePath, packageName, packageVersion);
    this._componentDescriptorStore[name] = object;
  }

  initBasics(packagePath: string, packageName: string, packageVersion: string | undefined): UcpComponentDescriptorInterface {
    this.npmPackage = { namespace: packagePath, path: packagePath, name: packageName, version: packageVersion }
    this.myClass.registerDescriptor(this, packagePath, packageName, packageVersion);
    return this;
  }
}

export type UcpComponentDescriptorInitParameters = {
  path: string;
  relativePath: string;
};
