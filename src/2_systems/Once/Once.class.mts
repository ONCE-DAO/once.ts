import { loadType, OnceMode, OnceNodeImportLoader, preloadType, resolveType } from "../../3_services/Once.interface.mjs";
import OnceKernel from "../../1_infrastructure/OnceKernel.class.mjs";

await OnceKernel.start();

export let load: loadType | undefined, resolve: resolveType | undefined, globalPreload: preloadType | undefined;
if (ONCE.mode === OnceMode.NODE_LOADER) {
  load = (ONCE as OnceNodeImportLoader).load;
  resolve = (ONCE as OnceNodeImportLoader).resolve
  globalPreload = (ONCE as OnceNodeImportLoader).globalPreload
}