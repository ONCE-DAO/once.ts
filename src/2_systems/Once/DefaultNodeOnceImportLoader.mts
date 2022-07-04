import { loaderReturnValue } from "../../3_services/Loader.interface.mjs";
import Once, { OnceMode, OnceState, resolveContext, loadContext, OnceNodeImportLoader } from "../../3_services/Once.interface.mjs";
import DefaultIOR from "../Things/DefaultIOR.class.mjs";
import { AbstractNodeOnce } from "./AbstractNodeOnce.mjs";

export default class DefaultNodeOnceImportLoader extends AbstractNodeOnce implements Once, OnceNodeImportLoader {
  mode = OnceMode.NODE_LOADER;
  state = OnceState.DISCOVER_SUCCESS;

  // static async start() {
  //   const scenarioDomain = process.env.SCENARIO_DOMAIN || EAMD_CONSTANTS.DEFAULT_SCENARIO_DOMAIN
  //   const basePath = process.env.BASE_PATH || process.cwd()
  //   const eamd = await DefaultEAMD.init(basePath, scenarioDomain)
  //   return new DefaultNodeOnceImportLoader(eamd);
  // }

  async start(): Promise<void> {
  }

  async resolve(
    specifier: string,
    context: resolveContext,
    defaultResolve: Function
  ): Promise<{ url: string }> {
    if (specifier.startsWith("ior:"))
      specifier = await DefaultIOR.load(specifier, { returnValue: loaderReturnValue.PATH });
    return defaultResolve(specifier, context, defaultResolve);
  }

  async load(
    url: string,
    context: loadContext,
    defaultLoad: Function
  ): Promise<{
    format: "builtin" | "commonjs" | "json" | "module" | "wasm";
    source: string | ArrayBuffer | Int8Array;
  }> {
    return defaultLoad(url, context, defaultLoad);
  }

  /**
 * This example has the application context send a message to the loader
 * and sends the message back to the application context
 * @returns {string} Code to run before application startup
 */
  globalPreload() {
    global.NODE_JS = true;
    return ""
  }
}

