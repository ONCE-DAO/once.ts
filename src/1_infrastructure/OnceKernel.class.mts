import OnceNode from "../2_systems/OnceNode.class.mjs";
import Once, { OnceRuntimeResolver } from "../3_services/Once.interface.mjs";
export default abstract class OnceKernel {
  static async start(): Promise<Once> {
    const once: Once = await this.discover();
    await once.start();
    console.log(`
    ----------------------------------
    ONCE started
    created:\t${once.creationDate.toISOString()}
    mode:\t${once.mode}
    state:\t${once.state}
    ----------------------------------
    `);

    return once;
  }

  static async discover(): Promise<Once> {
    console.log("START DISCOVER");

    if (this.RuntimeIs.NODE_LOADER()) {
      return (
        await import(
          "../../../../../Once.Loader/dist/once.loader/main/2_systems/OnceNodeImportLoader.mjs"
        )
      ).default.start();
    }
    if (this.RuntimeIs.NODE_JS()) {
      return (
        await import(
          "../../../../../Once.Server/dist/once.server/main/OnceServer.mjs"
        )
      ).default.start();
    }
    if (this.RuntimeIs.BROWSER()) {
    }
    if (this.RuntimeIs.SERVICE_WORKER()) {
    }
    if (this.RuntimeIs.WEB_WORKER()) {
    }
    return new OnceNode();
  }

  static get RuntimeIs(): OnceRuntimeResolver {
    return {
      BROWSER: () =>
        typeof window !== "undefined" && typeof window.document !== "undefined",
      NODE_JS: () =>
        typeof process !== "undefined" &&
        process.versions != null &&
        process.versions.node != null &&
        global.NODE_JS !== undefined &&
        global.NODE_JS === true,
      NODE_LOADER: () =>
        typeof process !== "undefined" &&
        process.versions != null &&
        process.versions.node != null &&
        global.NODE_JS === undefined,
      SERVICE_WORKER: () =>
        typeof self === "object" &&
        self.constructor &&
        self.constructor.name === "ServiceWorkerGlobalScope",
      WEB_WORKER: () =>
        typeof self === "object" &&
        self.constructor &&
        self.constructor.name === "DedicatedWorkerGlobalScope",
    };
  }

  static test() {
    return "test";
  }
}
