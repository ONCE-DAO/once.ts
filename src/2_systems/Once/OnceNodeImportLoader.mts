import DefaultEAMD from "../../1_infrastructure/EAMD.class.mjs";
import { loaderReturnValue } from "../../3_services/Loader.interface.mjs";
import Once, { OnceMode, OnceState, resolveContext, loadContext, OnceNodeImportLoader } from "../../3_services/Once.interface.mjs";
import Scenario from "../Scenario.class.mjs";
import DefaultIOR from "../Things/DefaultIOR.class.mjs";
import { BaseNodeOnce } from "./BaseOnce.class.mjs";
import SourceFile from "../../../../../Components/tla/EAM/Once/once@build/src/2_systems/Once/SourceFile.class.mjs";

export default class DefaultOnceNodeImportLoader extends BaseNodeOnce implements Once, OnceNodeImportLoader {
  mode = OnceMode.NODE_LOADER;
  state = OnceState.DISCOVER_SUCCESS;
  global: typeof globalThis = global;

  static async start() {
    const eamd = await DefaultEAMD.getInstance(Scenario.Default)
    return new DefaultOnceNodeImportLoader(eamd);
  }

  get OnceLoader() {
    return this;
  }


  async start(): Promise<void> {
    console.log("ONCE WILL START AS NODE_LOADER");

    // const asyncStartProcess = new Promise((resolve, reject) => {

    //   setTimeout(() => {
    //     console.log("e.g. Once is Installed")
    //   }, 1000);

    //   setTimeout(() => {
    //     console.log("or eamd is discovered")
    //   }, 2000);
    //   setTimeout(() => {
    //     console.log("or something else")
    //     resolve(undefined);
    //   }, 3000);
    // });

    console.log(new Date())
    // await asyncStartProcess
    console.log(new Date())

    console.log("ONCE STARTED AS NODE_LOADER");
  }


  async resolve(
    specifier: string,
    context: resolveContext,
    defaultResolve: Function
  ): Promise<{ url: string }> {
    console.log("RESOLVE", specifier);
    if (specifier.startsWith("ior:"))
      specifier = await DefaultIOR.load(specifier, { returnValue: loaderReturnValue.path });



    const result = defaultResolve(specifier, context, defaultResolve);

    if (context.parentURL) {
      let parent = SourceFile.getSourceFile(context.parentURL)
      let child = parent.addLoadedFile(result.url)
      child.check4Loop();
      console.log("PUML:", `"${this.normalizePath4Url(parent.path)}" =up=> "${this.normalizePath4Url(child.path)}"`);
    }
    return result
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
 * @param {{
     port: MessagePort,
   }} utilities Things that preload code might find useful
 * @returns {string} Code to run before application startup
 */
  globalPreload() {
    console.log("GLOBAL_PRELOAD")
    global.NODE_JS = true;
    return "console.log('GLOBAL RELOAD RETURN LOG');"
  }
}

