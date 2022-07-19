import { extname } from "path";
import UcpUnit, { UnitType } from "../../3_services/UCP/UcpUnit.interface.mjs";

export default class DefaultUcpUnit implements UcpUnit {
    unitType: UnitType = UnitType.File;
    href: string = "";
    //@TODO Add for Marcel
    // name: string
    //lifecycle: lifecycle
    //command: string | Command
    constructor(unitType: UnitType, href: string) {
        this.unitType = unitType;
        this.href = href;
    }
}