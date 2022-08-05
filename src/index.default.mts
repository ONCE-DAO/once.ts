import { loadType, OnceMode, OnceState, preloadType, resolveType } from "./3_services/Once.interface.mjs";
import { loaderReturnValue, loadingConfig } from "./3_services/Loader.interface.mjs";
import { urlProtocol } from "./3_services/Url.interface.mjs";
import ClassDescriptorHandler from "./2_systems/Descriptors/ClassDescriptorHandler.class.mjs";
import InterfaceDescriptorHandler from "./2_systems/Descriptors/InterfaceDescriptorHandler.class.mjs";

export { loadingConfig, loaderReturnValue, urlProtocol, loadType, OnceMode, OnceState, preloadType, resolveType, InterfaceDescriptorHandler, ClassDescriptorHandler }