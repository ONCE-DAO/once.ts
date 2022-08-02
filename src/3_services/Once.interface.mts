import OldEAMD from "../3_services/EAMD.interface.mjs";
import EAMRepository from "./Build/EAMRepository.interface.mjs";
import NamespaceInterface from "./Namespace/Namespace.interface.mjs";
import EAMD from "./UCP/EAMD.interface.mjs";

declare global {
  var ONCE: Once | OnceNodeImportLoader;
  var NODE_JS: boolean;
}

export default interface Once {
  ENV: NodeJS.ProcessEnv;
  creationDate: Date;
  mode: OnceMode;
  state: OnceState;
  global: typeof globalThis;
  eamd: EAMD;
  /**
   * @deprecated
   */
  oldEamd: OldEAMD
  rootNamespace: NamespaceInterface

  start(): Promise<void>;
  get isNodeJSEnvironment(): boolean;
}

export interface OnceNodeImportLoader extends Once {
  resolve: resolveType
  load: loadType
  globalPreload(): string
}

export interface JestOnce extends OnceNodeImportLoader {
  srcEamd: EAMRepository
}

export type preloadType = {
  (): string
}

export type resolveType = (specifier: string, context: resolveContext, defaultResolve: Function) => Promise<{
  url: string;
}>
export type loadType = {
  (
    url: string,
    context: loadContext,
    defaultLoad: Function
  ): Promise<{
    format: "builtin" | "commonjs" | "json" | "module" | "wasm";
    source: string | ArrayBuffer | Int8Array;
  }>
}

export type resolveContext = {
  conditions: string[];
  importAssertions: object;
  parentURL: string | undefined;
};

export type loadContext = {
  format: string | null | undefined;
  importAssertions: any;
};


/* eslint-disable no-unused-vars */
export enum OnceState {
  DISCOVER = "DISCOVER",
  DISCOVER_FAILED = "DISCOVER_FAILED",
  DISCOVER_SUCCESS = "DISCOVER_SUCESS",
  INITIALIZED = "INITIALIZED",
  STARTED = "STARTED",
  STOPPED = "STOPPED",
}

export enum OnceMode {
  BOOTING = "BOOTING",
  BROWSER = "BROWSER",
  NODE_JS = "NODE_JS",
  NODE_LOADER = "NODE_LOADER",
  WEB_WORKER = "WEB_WORKER",
  SERVICE_WORKER = "SERVICE_WORKER",
  I_FRAME = "I_FRAME",
  NOT_DISCOVERED = "NOT_DISCOVERED",
  TEST_ENVIRONMENT = "TEST_ENVIRONMENT",
}

type OnceRuntime =
  | OnceMode.BROWSER
  | OnceMode.NODE_JS
  | OnceMode.NODE_LOADER
  | OnceMode.WEB_WORKER
  | OnceMode.SERVICE_WORKER
  | OnceMode.TEST_ENVIRONMENT

export type OnceRuntimeResolver = {
  [key in OnceRuntime]: () => boolean;
};