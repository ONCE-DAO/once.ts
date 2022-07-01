import UcpUnit from "./UcpUnit.interface.mjs";

export default interface UcpComponentDescriptorInterface {
    get name(): string
    get version(): string
    get srcPath(): string
    units: UcpUnit[]
    relativeSrcPath: string | undefined;
}