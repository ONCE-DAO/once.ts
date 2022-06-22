// import Once, { OnceMode, OnceState } from "ior:esm:/tla.EAM.Thinglish[dev]";

import Once, { OnceMode, OnceState } from "../../../../../../../Scenarios/localhost/tla/EAM/Thinglish/dev/index.mjs";


export default class OnceNode implements Once {
  global = global;
  ENV = process.env;
  creationDate = new Date();
  mode = OnceMode.NODE_JS;
  state = OnceState.STARTED;
  async start(): Promise<void> { }
}
