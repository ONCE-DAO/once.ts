import BaseLoader from "../../1_infrastructure/AbstractDefaultLoader.class.mjs";
import IOR from "../../3_services/IOR.interface.mjs";
import Loader, { LoaderStatic, loadingConfig } from "../../3_services/Loader.interface.mjs";
import FileSystemLoader from "../Loader/FileSystemLoader.class.mjs";
import InterfaceDescriptorHandler from "./InterfaceDescriptorHandler.class.mjs";

export default class DefaultLoader extends BaseLoader {
    removeObjectFromStore(object: any): void {
        throw new Error("Method not implemented.");
    }
    addObject2Store(ior: IOR, object: any): void {
        throw new Error("Method not implemented.");
    }
    load(ior: IOR, config: loadingConfig): Promise<any> {
        throw new Error("Method not implemented.");
    }
    canHandle(ior: IOR): number {
        return 0;
    }

    static discover(): LoaderStatic[] {
        return [...new Set([...InterfaceDescriptorHandler.getInterfaceDescriptor<Loader>().implementations, FileSystemLoader] as LoaderStatic[])];
    }

    static findLoader(ior: IOR): Loader | undefined {

        const loaderList = this.discover();
        let ratedLoader = loaderList.map(loader => {
            return { rating: loader.canHandle(ior), loader }
        })
            .filter(loader => loader.rating > 0)
            .sort((a, b) => b.rating - a.rating);

        if (ratedLoader.length > 0) {
            return ratedLoader[0].loader.factory(ior);
        }

    }

}
