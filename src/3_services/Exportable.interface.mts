import IOR from "./IOR.interface.mjs";

export default interface Exportable {
    export(): any
    import(data: any): void
    IOR: IOR;
    classDescriptor: { IOR: IOR }
}