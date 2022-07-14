import { loadType, OnceMode, OnceNodeImportLoader, preloadType, resolveType } from "../../3_services/Once.interface.mjs";
import OnceKernel from "../../1_infrastructure/OnceKernel.class.mjs";

await OnceKernel.start();

export let load: loadType | undefined, resolve: resolveType | undefined, globalPreload: preloadType | undefined;
if (ONCE.mode === OnceMode.NODE_LOADER) {
  load = (ONCE as OnceNodeImportLoader).load.bind(ONCE);
  resolve = (ONCE as OnceNodeImportLoader).resolve.bind(ONCE)
  globalPreload = (ONCE as OnceNodeImportLoader).globalPreload.bind(ONCE)
}

console.log("EXPORT VALUES", load, resolve, globalPreload)
