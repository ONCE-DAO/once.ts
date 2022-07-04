import IOR from "../../3_services/IOR.interface.mjs";
import Loader, {
  loaderReturnValue,
  loadingConfig,
} from "../../3_services/Loader.interface.mjs";
import { urlProtocol } from "../../3_services/Url.interface.mjs";
import AbstractDefaultLoader from "../../1_infrastructure/AbstractDefaultLoader.class.mjs";

export default class FileSystemLoader extends AbstractDefaultLoader implements Loader {
  static canHandle(ior: IOR): number {
    if (ior.protocol.includes(urlProtocol.esm) && ior.package !== undefined) {
      return 1;
    }
    return 0;
  }

  removeObjectFromStore(object: any): void {
    throw new Error("Method not implemented.");
  }
  addObject2Store(ior: IOR, object: any): void {
    throw new Error("Method not implemented.");
  }
  async load(ior: IOR, config: loadingConfig): Promise<any> {
    if (this.canHandle(ior) !== 1 || !ior.package)
      throw new Error("Can not load this IOR");
    if (typeof ONCE === "undefined") throw new Error("global ONCE is not defined");
 
    let eamdRepos = await ONCE.eamd.discover()
    let iorString = ior.href;
    if (ior.namespaceObject) {
      iorString = iorString.replace('/' + ior.namespaceObject, '')
    }

    const modulePath = eamdRepos[iorString];
    if (modulePath === undefined) {
      throw new Error(
        "Missing installation from Namespace to Repository: " + iorString
      );
    }

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
    return FileSystemLoader.canHandle(ior);
  }
}