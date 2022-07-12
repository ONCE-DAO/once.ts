import DefaultIOR from "./2_systems/Things/DefaultIOR.class.mjs";
import EAMD from "./3_services/EAMD.interface.mjs";
import BaseOnce from "./1_infrastructure/BaseOnce.class.mjs";
import Once, { OnceMode, OnceState } from "./3_services/Once.interface.mjs";
import InterfaceDescriptor from "./2_systems/Things/InterfaceDescriptor.class.mjs";
import ClassDescriptor from "./2_systems/Things/ClassDescriptor.class.mjs";
import InterfaceDescriptorInterface from "./3_services/Thing/InterfaceDescriptor.interface.mjs";
import ClassDescriptorInterface from "./3_services/Thing/ClassDescriptor.interface.mjs";
import BaseThing from "./1_infrastructure/BaseThing.class.mjs";
import OnceKernel from "./1_infrastructure/OnceKernel.class.mjs";
import Thing, { ThingStatics } from "./3_services/Thing/Thing.interface.mjs";
import IOR from "./3_services/IOR.interface.mjs";
import Class from "./3_services/Class.interface.mjs";
import UUiD from "./2_systems/JSExtensions/UUiD.class.mjs";
import ExtendedPromise, { promiseHandler } from "./2_systems/Promise.class.mjs";
import ServerSideUcpComponentDescriptorI from "./2_systems/Things/ServerSideUcpComponentDescriptor.class.mjs";
import BaseLoader from "./1_infrastructure/BaseLoader.class.mjs";
import { LoaderID, loaderReturnValue, loadingConfig } from "./3_services/Loader.interface.mjs";
import { urlProtocol } from "./3_services/Url.interface.mjs";
import { ServerSideUcpComponentDescriptorInterface } from "./3_services/Thing/UcpComponentDescriptor.interface.mjs";
import EAMDInterface from "./3_services/EAMD.interface.mjs";
import BaseNodeOnceI from "./1_infrastructure/BaseNodeOnce.class.mjs";
import Client, { ClientID, ClientStatic, ClientStaticID } from "./3_services/Client.interface.mjs";
import CRUD_Client from "./3_services/CRUDClient.interface.mjs";
import REST_Client, { REST_ClientID } from "./3_services/RestClient.interface.mjs";
import DefaultClient from "./2_systems/Things/DefaultClient.class.mjs";


export let BaseNodeOnce: typeof BaseNodeOnceI | undefined;
export let ServerSideUcpComponentDescriptor: typeof ServerSideUcpComponentDescriptorI | undefined

if (typeof ONCE !== "undefined" && ONCE.mode !== OnceMode.BROWSER) {
    BaseNodeOnce = (await import("./1_infrastructure/BaseNodeOnce.class.mjs")).default;
    ServerSideUcpComponentDescriptor = (await import("./2_systems/Things/ServerSideUcpComponentDescriptor.class.mjs")).default;
}

export {
    DefaultIOR, EAMD, Once, OnceMode, OnceState,
    InterfaceDescriptor, ClassDescriptor, InterfaceDescriptorInterface,
    ClassDescriptorInterface, BaseThing, OnceKernel, ThingStatics, Thing, IOR, Class, UUiD,
    ExtendedPromise, promiseHandler, BaseLoader, loadingConfig, urlProtocol, LoaderID,
    ServerSideUcpComponentDescriptorInterface, BaseOnce, EAMDInterface, loaderReturnValue,
    Client, ClientID, CRUD_Client, ClientStatic, ClientStaticID, REST_Client, REST_ClientID, DefaultClient
}