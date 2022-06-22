import { resolve, load, globalPreload } from "ior:esm:/tla.EAM.Once.Loader[dev]";
import OnceKernel from "../1_infrastructure/OnceKernel.class.mjs";
await OnceKernel.start();
export {
  load,
  resolve,
  globalPreload,
} 