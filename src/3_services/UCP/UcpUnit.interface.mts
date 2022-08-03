
export default interface UcpUnit {
    name: string
    unitType: UnitType;
    href?: string;
}

export enum UnitType {
    File = "File",
    Lifecycle = "Lifecycle",
    TypescriptInterface = "TypescriptInterface",
    TypescriptClass = "TypescriptClass",
}
