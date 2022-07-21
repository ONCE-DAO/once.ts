import UcpInterfaceObject, { UcpInterfaceType } from "../../3_services/UCP/UcpInterface.class.mjs";

export default class DefaultUcpInterface implements UcpInterfaceObject {
    constructor(public type: UcpInterfaceType, public name: string, public unitDefaultExport: boolean, public unitName: string) {
    }

}