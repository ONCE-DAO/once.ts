import { OnceMode, OnceState } from "../../3_services/Once.interface.mjs";
import { BaseNodeOnce } from "./BaseOnce.class.mjs";

export default class OnceNode extends BaseNodeOnce {
  global = global;
  ENV = process.env;
  creationDate = new Date();
  mode = OnceMode.NODE_JS;
  state = OnceState.STARTED;
  async start(): Promise<void> { }
}
