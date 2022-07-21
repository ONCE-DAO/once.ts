
// unknown in case the type can not be discovered
export type UcpInterfaceType = 'TypescriptClass' | 'TypescriptInterface' | 'TypescriptType' | 'TypescriptEnum' | "unknown"


export default interface UcpInterfaceObject {
    type: UcpInterfaceType,
    name: string,
    unitDefaultExport: boolean,
    unitName: string
}
