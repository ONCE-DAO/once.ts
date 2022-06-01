import OnceKernel from "../1_infrastructure/OnceKernel.class.mjs";
await OnceKernel.start();
export {
  load,
  resolve,
  globalPreload,
} from "../../../../../Once/dist/once.loader/main/2_systems/OnceNodeImportLoader.mjs";
