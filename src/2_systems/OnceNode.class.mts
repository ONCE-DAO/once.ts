import Once, { OnceMode, OnceState } from "ior:esm:/tla.EAM.Thinglish[main]";


export default class OnceNode implements Once {
  ENV = process.env;
  creationDate = new Date();
  mode = OnceMode.NODE_JS;
  state = OnceState.STARTED;
  async start(): Promise<void> { }
}
