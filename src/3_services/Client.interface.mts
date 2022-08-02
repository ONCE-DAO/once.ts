import InterfaceDescriptor from "../2_systems/Things/InterfaceDescriptor.class.mjs";

import Class from "./Class.interface.mjs";
import IOR from "./IOR.interface.mjs";

export default interface Client {
    canConnect(ior: IOR): number;
    init(ior: IOR): Client;

}


export interface ClientStatic extends Class<ClientStatic> {
    factory(ior: IOR): Client;
    canConnect(ior: IOR): number;
}
