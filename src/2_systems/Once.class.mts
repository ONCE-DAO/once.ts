import OnceKernel from "../1_infrastructure/OnceKernel.class.mjs";
await OnceKernel.start();
export {
  load,
  resolve,
  globalPreload,
} from "../../../../../../../../Scenarios/localhost/tla/EAM/Once/loader/main/dist/2_systems/OnceNodeImportLoader.mjs"