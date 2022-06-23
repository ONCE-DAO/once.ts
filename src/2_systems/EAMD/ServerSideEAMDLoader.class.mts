import IOR from "../../3_services/IOR.interface.mjs";
import Loader, {
  loaderReturnValue,
  LoaderStatic,
  loadingConfig,
} from "../../3_services/Loader.interface.mjs";
import { urlProtocol } from "../../3_services/Url.interface.mjs";
import BaseLoader from "../../1_infrastructure/BaseLoader.class.mjs";
import path from "path";

class EAMDLoader extends BaseLoader implements Loader {
  removeObjectFromStore(object: any): void {
    throw new Error("Method not implemented.");
  }
  addObject2Store(ior: IOR, object: any): void {
    throw new Error("Method not implemented.");
  }


  async load(ior: IOR, config: loadingConfig): Promise<any> {
    // Shortcut for once itself

    if (this.canHandle(ior) !== 1 || !ior.namespace)
      throw new Error("Can not load this IOR");


    if (typeof ONCE === "undefined") throw new Error("Missing ONCE");
    if (ONCE.eamd == undefined) throw new Error("Missing EAMD in ONCE");

    let eamdRepos = (await global.ONCE?.eamd?.discover());

    const repoPath = eamdRepos?.[ior.href];
    if (repoPath === undefined) {
      throw new Error(
        "Missing Mapping from Namespace to Repository: " + ior.href
      );
    }
    // Build ist deaktiviert

    // if (!ONCE.eamd.eamdRepository) throw new Error("Missing eamdRepository");
    // let submodules = await ONCE.eamd.eamdRepository.getAndInstallSubmodule(
    //   ior,
    //   repoPath
    // );

    if (!ONCE.eamd.eamdDirectory) throw new Error("missing EAMD Directory")

    const modulePath = path.join(ONCE.eamd.eamdDirectory, repoPath);

    if (config?.returnValue === loaderReturnValue.path) {
      return modulePath;
    } else {
      const result = await import(modulePath);

      // HACK should be removed after Components exists
      if (ior.namespaceObject !== undefined) {
        if (!result[ior.namespaceObject])
          throw new Error(
            `Missing Object '${ior.namespaceObject}' in the export from file: '${modulePath}'`
          );
        return result[ior.namespaceObject];
      } else {
        return result;
      }
    }
  }

  canHandle(ior: IOR): number {
    return EAMDLoader.canHandle(ior);
  }

  static canHandle(ior: IOR): number {
    if (ior.protocol.includes(urlProtocol.esm) && ior.namespace !== undefined) {
      return 1;
    }
    return 0;
  }
}

export default EAMDLoader as LoaderStatic;
