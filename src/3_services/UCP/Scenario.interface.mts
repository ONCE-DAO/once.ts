import { UcpComponentDescriptorInterface } from "./UcpComponentDescriptor.interface.mjs";

export default interface Scenario {
    namespace: string;
    scenarioPath: string;
    get webRoot(): string;
    get componentDescriptors(): Promise<UcpComponentDescriptorInterface[]>

    init(): Promise<Scenario>;

}
