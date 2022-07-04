import { OnceMode, OnceState } from "../../3_services/Once.interface.mjs";
import { AbstractNodeOnce } from "./AbstractNodeOnce.mjs";

export default class NodeOnce extends AbstractNodeOnce {
  global = global;
  ENV = process.env;
  creationDate = new Date();
  mode = OnceMode.NODE_JS;
  state = OnceState.STARTED;

  async start(): Promise<void> {
    await import("../Loader/FileSystemLoader.class.mjs")
  }
}
