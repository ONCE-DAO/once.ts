import { loaderReturnValue } from "../../3_services/Loader.interface.mjs";
import Once, { OnceMode, OnceState, resolveContext, loadContext, OnceNodeImportLoader } from "../../3_services/Once.interface.mjs";
import DefaultIOR from "../NewThings/DefaultIOR.class.mjs";
import { AbstractNodeOnce } from "./AbstractNodeOnce.mjs";
import SourceFile from "./SourceFile.class.mjs";

export default class DefaultNodeOnceImportLoader extends AbstractNodeOnce implements Once, OnceNodeImportLoader {
  mode = OnceMode.NODE_LOADER;
  state = OnceState.DISCOVER_SUCCESS;

  async start(): Promise<void> {
    await super.start();
    console.log("Load FileSystemLoader into store")
    await import("../Loader/FileSystemLoader.class.mjs")
  }

  private normalizePath4Url(path: string): string {
    return path.replace(/\.m[tj]s$/, '').replace(/.*\/EAMD\.ucp\//, '').replaceAll('.', '_').replace(/\/([12345]_\w+)/, '.$1');
  }

  async resolve(
    originalSpecifier: string,
    context: resolveContext,
    defaultResolve: Function
  ): Promise<{ url: string }> {
    let specifier: string = originalSpecifier;
    if (specifier.startsWith("ior:") || specifier.startsWith("/ior:"))
      specifier = await DefaultIOR.load(specifier, { returnValue: loaderReturnValue.path });

    let result: { url: string };

    try {
      result = await defaultResolve(specifier, context, defaultResolve);
    } catch (e) {
      //HACK standard resolver need to handle that case
      result = await defaultResolve(specifier + '.js', context, defaultResolve);

    }



    //console.log("RESOLVER: " + originalSpecifier + ' ' + specifier);

    if (context.parentURL) {
      let parent = SourceFile.getSourceFile(context.parentURL)
      let child = parent.addLoadedFile(result.url)
      child.check4Loop();
      //console.log("PUML:", `"${this.normalizePath4Url(parent.path)}" =up=> "${this.normalizePath4Url(child.path)}"`);
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
 * @returns {string} Code to run before application startup
 */
  globalPreload() {
    global.NODE_JS = true;
    return ""
  }
}

