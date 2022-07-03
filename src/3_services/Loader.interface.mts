import InterfaceDescriptor from "../2_systems/Things/InterfaceDescriptor.class.mjs";

import Class from "./Class.interface.mjs";
import IOR from "./IOR.interface.mjs";
import { ThingStatics } from "./Thing/Thing.interface.mjs";

export enum loaderReturnValue { "default", "path" }

export type loadingConfig = { usedByClass?: Class<any>, returnValue?: loaderReturnValue } | undefined;


export interface Loader {

    load(ior: IOR, config?: loadingConfig): Promise<any>
    canHandle(ior: IOR): number
    removeObjectFromStore(object: IOR | any): void
    addObject2Store(ior: IOR, object: any | Promise<any>): void;
}

export const LoaderID = InterfaceDescriptor.lastDescriptor;
LoaderID.componentExport = 'namedExport';

export interface LoaderStatic extends ThingStatics<LoaderStatic> {
    canHandle(ior: IOR): number
    factory(ior: IOR): Loader
    new(...args: any[]): Loader;
}

export default Loader;