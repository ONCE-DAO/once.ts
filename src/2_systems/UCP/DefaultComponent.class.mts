import UcpComponentDescriptorInterface from "../../3_services/Thing/UcpComponentDescriptor.interface.mjs";
import ComponentInterface from "../../3_services/UCP/Component.interface.mjs";
import { Unit } from "../../3_services/UCP/Unit.interface.mjs";
import UcpComponentDescriptor from "../Things/BaseUcpComponentDescriptor.class.mjs";

export default class DefaultComponent implements ComponentInterface {
    descriptor: UcpComponentDescriptorInterface;
    units: Unit[] = [];
    constructor() {
        this.descriptor = UcpComponentDescriptor.getDescriptor("", "", "")
    }
    path: string = "";
    namespace: string = "";
    version: string = "";

    async prepareBuild(): Promise<void> {
        console.log("run prepareBuild for ", this.namespace)
    }

}