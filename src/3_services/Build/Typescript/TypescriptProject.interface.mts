import Buildable from "../Buildable.interface.mjs";

export default interface TypescriptProject extends Buildable {
    name: string;
    namespace: string;
    version: string;

}

export const TYPESCRIPT_PROJECT = {
    EXPORTS_FILE_NAME: "UcpExport"
}