export default interface UcpDependency {
    type: UcpDependencyType,
    name: string,
    reference: string
}

export enum UcpDependencyType {
    IOR = "IOR",
    npm = "npm",
}
