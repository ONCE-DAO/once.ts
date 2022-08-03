// ##IGNORE_TRANSFORMER##

import AbstractNamespaceChild from "../../1_infrastructure/AbstractNamespaceChild.class.mjs";
import IOR from "../../3_services/IOR.interface.mjs";
import { NamespaceObjectTypeName, NamespaceParent } from "../../3_services/Namespace/Namespace.interface.mjs";
import VersionFolder from "../../3_services/Namespace/VersionFolder.interface.mjs";
import ClassDescriptorInterface from "../../3_services/Thing/ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface from "../../3_services/Thing/InterfaceDescriptor.interface.mjs";
import UcpComponentDescriptorInterface, { UcpComponentDescriptorFileFormat } from "../../3_services/Thing/UcpComponentDescriptor.interface.mjs";
import DefaultIOR from "../NewThings/DefaultIOR.class.mjs";

export default class DefaultUcpComponentDescriptor extends AbstractNamespaceChild implements UcpComponentDescriptorInterface {
  objectType: NamespaceObjectTypeName.UcpComponentDescriptor = NamespaceObjectTypeName.UcpComponentDescriptor;

  export(): UcpComponentDescriptorFileFormat {
    return { name: this.name }
  }

  import(data: UcpComponentDescriptorFileFormat): void {
    this.name = data.name
  }

  get IOR(): IOR {
    let ior = this.parent.IOR;
    ior.pathName += `/${this.name}`;
    return ior;
  }

  static get IOR(): IOR {
    // HACK with hardcoded IOR
    return new DefaultIOR().init('ior:esm:/tla/EAM/Once/once[build]/DefaultUcpComponentDescriptor');
  }
  classDescriptor = { IOR: DefaultUcpComponentDescriptor.IOR };

  protected static readonly _componentDescriptorStore: { [i: string]: UcpComponentDescriptorInterface } = {};

  get units(): (ClassDescriptorInterface | InterfaceDescriptorInterface)[] {
    return this.parent.recursiveChildren([NamespaceObjectTypeName.ClassDescriptor, NamespaceObjectTypeName.InterfaceDescriptor]) as (ClassDescriptorInterface | InterfaceDescriptorInterface)[];
  }

  init(name: string): this {
    this.name = name;
    return this;
  }

  get version(): VersionFolder {
    let version = this.parent.getParentType(NamespaceObjectTypeName.VersionFolder);
    if (!version) throw new Error("Missing parent version")
    return version;
  }

  get package(): string {
    return this.version.package
  }


}


