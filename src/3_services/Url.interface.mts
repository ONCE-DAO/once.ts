
import { JSONProvider } from "./JSON.interface.mjs";

export enum urlProtocol {
  "http" = "http",
  "https" = "https",
  "ws" = "ws",
  "wss" = "wss",
  "ior" = "ior",
  "ude" = "ude",
  "git" = "git",
  "github" = "github",
  "file" = "file",
  "esm" = "esm",
  "rest" = "rest",
  "meta" = "meta",
}

type numberOrUndefined = number | undefined

export interface Url extends JSONProvider {

  href: string;
  protocol: urlProtocol[];
  port: number | undefined;
  search: string | undefined;
  hostName: string | undefined;
  host: string | undefined;
  pathName: string | undefined;
  path: string | undefined;
  hash: string | undefined;
  anchor: string | undefined;
  origin: string | undefined;
  isOwnOrigin: boolean;
  originPath: string | undefined;
  searchParameters: { [key: string]: string }
  hosts: string[];
  hostNames: string[];
  ports: numberOrUndefined[];
  fileName: string | undefined;
  fileType: string | undefined;
  fileTypes: string[];
  normalizedHref: string;
  init(href: string): this;
  clone(): Url;
}

export default Url;