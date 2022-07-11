import BaseNodeOnce from "../../1_infrastructure/BaseNodeOnce.class.mjs";
import { OnceMode, OnceState } from "../../3_services/Once.interface.mjs";

export default class OnceNode extends BaseNodeOnce {
  global = global;
  ENV = process.env;
  creationDate = new Date();
  mode = OnceMode.NODE_JS;
  state = OnceState.STARTED;
  async start(): Promise<void> { }
}
