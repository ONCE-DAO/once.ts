import { NamespaceChild } from "../Namespace/Namespace.interface.mjs";
import UcpUnit, { UnitType } from "./UcpUnit.interface.mjs";

export default interface FileUcpUnit extends NamespaceChild, UcpUnit {
    relativeComponentPath: string
}


export interface FileUcpUnitFileFormat {
    name: string,
    unitType: UnitType
    href: string;
}