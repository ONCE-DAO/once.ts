import IOR from "../../3_services/IOR.interface.mjs";
import Loader, {
  loaderReturnValue,
  LoaderStatic,
  loadingConfig,
} from "../../3_services/Loader.interface.mjs";
import { urlProtocol } from "../../3_services/Url.interface.mjs";
import AbstractDefaultLoader from "../../1_infrastructure/AbstractDefaultLoader.class.mjs";
import path from "path";

class EAMDLoader extends AbstractDefaultLoader implements Loader {
  removeObjectFromStore(object: any): void {
    throw new Error("Method not implemented.");
  }
  addObject2Store(ior: IOR, object: any): void {
    throw new Error("Method not implemented.");
  }


  async load(ior: IOR, config: loadingConfig): Promise<any> {
    // Shortcut for once itself

    if (this.canHandle(ior) !== 1 || !ior.package)
      throw new Error("Can not load this IOR");


    if (typeof ONCE === "undefined") throw new Error("Missing ONCE");
    if (ONCE.eamd == undefined) throw new Error("Missing EAMD in ONCE");

    //TODO
    //@ts-ignore
    let eamdRepos = (await global.ONCE?.eamd?.discover());
    let iorString = ior.href;
    if (ior.namespaceObject) {
      iorString = iorString.replace('/' + ior.namespaceObject, '')
    }
    const repoPath = eamdRepos?.[iorString];
    if (repoPath === undefined) {
      throw new Error(
        "Missing Mapping from Namespace to Repository: " + iorString
      );
    }
    // Build ist deaktiviert

    // if (!ONCE.eamd.eamdRepository) throw new Error("Missing eamdRepository");
    // let submodules = await ONCE.eamd.eamdRepository.getAndInstallSubmodule(
    //   ior,
    //   repoPath
    // );

    //TODO
    //@ts-ignore
    if (!ONCE.eamd.eamdDirectory) throw new Error("missing EAMD Directory")

    //TODO
    //@ts-ignore
    const modulePath = path.join(ONCE.eamd.eamdDirectory, repoPath);

    if (config?.returnValue === loaderReturnValue.PATH) {
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
    if (ior.protocol.includes(urlProtocol.esm) && ior.package !== undefined) {
      return 1;
    }
    return 0;
  }
}

export default EAMDLoader as LoaderStatic;
