// ##IGNORE_TRANSFORMER##
import UcpComponentDescriptorInterface, { UcpComponentDescriptorStatics } from "../../3_services/Thing/UcpComponentDescriptor.interface.mjs";

let ActiveUcpComponentDescriptor: UcpComponentDescriptorStatics;

// if (typeof window === "undefined") {
//   // let moduleItem = await import("./ServerSideUcpComponentDescriptor.class.mjs")
//   ActiveUcpComponentDescriptor = moduleItem.default;
// } else {
//   ActiveUcpComponentDescriptor = (await import("./DefaultUcpComponentDescriptor.class.mjs")).default;

// }

export default class UcpComponentDescriptor {


  static register(packagePath: string, packageName: string, packageVersion: string | undefined): Function {
    return ActiveUcpComponentDescriptor.register(packagePath, packageName, packageVersion);
  }

  static getDescriptor(packagePath: string, packageName: string, packageVersion: string | undefined): UcpComponentDescriptorInterface {
    return ActiveUcpComponentDescriptor.getDescriptor(packagePath, packageName, packageVersion);
  }

}