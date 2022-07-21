import UcpDependency, { UcpDependencyType } from "../../3_services/UCP/UcpDependency.interface.mjs";

export default class DefaultUcpDependency implements UcpDependency {
    constructor(public type: UcpDependencyType, public name: string, public reference: string) {
    }
}