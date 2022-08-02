import Client, { ClientStatic } from "../../3_services/Client.interface.mjs";
import IOR from "../../3_services/IOR.interface.mjs";
import DefaultCRUDClient from "./CRUDClient.class.mjs";
import InterfaceDescriptorHandler from "./InterfaceDescriptorHandler.class.mjs";

DefaultCRUDClient;


export default class DefaultClient {

    static discover(): ClientStatic[] {
        return InterfaceDescriptorHandler.getInterfaceDescriptor<Client>().implementations as ClientStatic[]
    }

    static findClient(ior: IOR): Client | undefined {

        const clientList = this.discover();
        let ratedLoader = clientList.map(client => {
            return { rating: client.canConnect(ior), client }
        })
            .filter(loader => loader.rating > 0)
            .sort((a, b) => b.rating - a.rating);

        if (ratedLoader.length > 0) {
            return ratedLoader[0].client.factory(ior);
        }

    }

}
