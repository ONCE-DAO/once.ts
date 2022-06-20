import Once, { OnceMode, OnceState } from "../../../../../../../../Scenarios/localhost/tla/EAM/Thinglish/thinglish/main/dist/3_services/Once.interface.mjs"

export default class OnceNode implements Once {
  ENV = process.env;
  creationDate = new Date();
  mode = OnceMode.NODE_JS;
  state = OnceState.STARTED;
  async start(): Promise<void> { }
}
