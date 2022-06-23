import Loader, { loadingConfig } from "./Loader.interface.mjs";
import Url from "./Url.interface.mjs";

export interface IOR extends Url {

  load(config?: loadingConfig): Promise<any>
  namespace: string | undefined;
  namespaceVersion: string | undefined;
  namespaceObject: string | undefined;
  id: string | undefined;
  clone(): IOR;
  loader: Loader | undefined;

}

export default IOR;