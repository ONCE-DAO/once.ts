import InterfaceDescriptor from "../2_systems/Things/InterfaceDescriptor.class.mjs";

import Client from "./Client.interface.mjs";
import { HttpResponse } from "./CRUDClient.interface.mjs";
import IOR from "./IOR.interface.mjs";



export default interface REST_Client extends Client {
  POST(ior: IOR, data?: any): Promise<HttpResponse>
  GET(ior: IOR): Promise<HttpResponse>
  PUT(ior: IOR, data?: any): Promise<HttpResponse>
  DELETE(ior: IOR): Promise<HttpResponse>
}
