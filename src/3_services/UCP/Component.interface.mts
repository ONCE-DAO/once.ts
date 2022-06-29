import UcpComponentDescriptorInterface from "../Thing/UcpComponentDescriptor.interface.mjs";
import { Unit } from "./Unit.interface.mjs";

export default interface Component {
    path: string;
    namespace: string;
    version: string;
    units: Unit[];
    descriptor: UcpComponentDescriptorInterface;
    prepareBuild(): Promise<void>
}
