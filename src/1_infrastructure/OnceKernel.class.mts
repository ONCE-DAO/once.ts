import Once, { OnceRuntimeResolver } from "../3_services/Once.interface.mjs"
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
    once.global.ONCE = once;
    return once;
  }


  static async discover(): Promise<Once> {
    console.log("Try to discover runtime");

    if (this.RuntimeIs.NODE_LOADER()) {
      return (
        await import(
          "../2_systems/Once/OnceNodeImportLoader.mjs"
        )
      ).default.start();
    }
    if (this.RuntimeIs.NODE_JS()) {
      await import("../2_systems/EAMD/ServerSideEAMDLoader.class.mjs")
      return await (
        await import(
          "ior:esm:/tla.EAM.Once.Server[dev]"
        )
      ).OnceNodeServer.start()

    }
    if (this.RuntimeIs.BROWSER()) {
    }
    if (this.RuntimeIs.SERVICE_WORKER()) {
    }
    if (this.RuntimeIs.WEB_WORKER()) {
    }
    //TODO@Merge maybe replace with non discovered ONCE
    throw new Error("Once not discovered")
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

}
