import BaseThing from "../../1_infrastructure/BaseThing.class.mjs";
import Client from "../../3_services/Client.interface.mjs";
import CRUD_Client, { HttpResponse } from "../../3_services/CRUDClient.interface.mjs";
import IOR from "../../3_services/IOR.interface.mjs";
import { OnceMode } from "../../3_services/Once.interface.mjs";
import REST_Client from "../../3_services/RestClient.interface.mjs";
import { urlProtocol } from "../../3_services/Url.interface.mjs";
import DefaultIOR from "../NewThings/DefaultIOR.class.mjs";


type RequestInfo = import("node-fetch/@types/index").RequestInfo;
type RequestInit = import("node-fetch/@types/index").RequestInit;
type Response = import("node-fetch/@types/index").Response;

let internalFetch: (url: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

//HACK ONCE mode on Import
if (typeof window == "undefined" && (typeof ONCE == 'undefined' || ONCE.mode !== OnceMode.BROWSER)) {
    internalFetch = (await import('node-fetch')).default;
} else {
    //@ts-ignore
    internalFetch = fetch;
}

enum REST_Method { 'GET' = 'GET', 'POST' = 'POST', 'PUT' = 'PUT', 'DELETE' = 'DELETE' }



// BUG There should be an interface, but it dose not work!?!
//const DefaultCRUDClient: ClientStatic = 
export default class DefaultCRUDClient extends BaseThing<CRUD_Client> implements CRUD_Client, REST_Client, Client {

    private static _store: { [index: string]: DefaultCRUDClient } = {};
    private _clientIOR!: IOR;

    static factory(ior: IOR): Client {
        if (!ior.host) throw new Error("Missing host in IOR")
        const storedObject = this._store[ior.host];
        if (storedObject) {
            return storedObject;
        }
        return new DefaultCRUDClient().init(ior);
    }

    static canConnect(ior: IOR): number {
        if (ior.protocol.includes(urlProtocol.ude)) return 1;
        if (ior.protocol.includes(urlProtocol.rest)) return 1;
        return 0;
    }

    canConnect(ior: IOR): number {
        if (DefaultCRUDClient.canConnect(ior) == 1) {
            if (ior.host === this._clientIOR.host) {
                return 1;
            }
        }
        return 0;
    }

    init(ior: IOR): this {
        if (!ior.host) throw new Error("Missing Host in IOR");
        this._clientIOR = new DefaultIOR().init(ior.host);
        //HACK
        //@ts-ignore
        this.classDescriptor.class._store[ior.host] = this;
        return this;
    }

    POST(ior: IOR, data?: any): Promise<HttpResponse> {
        return this._call(ior, REST_Method.POST, data);
    }
    GET(ior: IOR): Promise<HttpResponse> {
        return this._call(ior, REST_Method.GET);
    }
    PUT(ior: IOR, data?: any): Promise<HttpResponse> {
        return this._call(ior, REST_Method.PUT, data);
    }
    DELETE(ior: IOR): Promise<HttpResponse> {
        return this._call(ior, REST_Method.DELETE);
    }


    async create(ior: IOR, data?: any): Promise<HttpResponse> {
        return this._call(ior, REST_Method.POST, data);
    }
    async retrieve(ior: IOR): Promise<HttpResponse> {
        return this._call(ior, REST_Method.GET);
    }
    async update(ior: IOR, data?: any): Promise<HttpResponse> {
        return this._call(ior, REST_Method.PUT, data);
    }
    async delete(ior: IOR): Promise<HttpResponse> {
        return this._call(ior, REST_Method.DELETE);
    }

    private async _call(ior: IOR, method: REST_Method, data?: any): Promise<HttpResponse> {

        let requestData: RequestInit = { method };

        requestData.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }

        if (data) {
            requestData.body = JSON.stringify(data);
        }

        let response: HttpResponse = await internalFetch(ior.normalizedHref, requestData);
        const type = response.headers.get('Content-Type');
        if (type && type.match(/json/)) {
            response.parsedData = await response.clone().json()
        } else {
            response.parsedData = await response.text();
        }

        return response;
    }


}