import { PluginConfig } from "ts-patch"
import ts from "typescript"

export default interface Transformer {
    transpile(): Promise<string[]>
    writeConfigPaths(files: string[],name:string, namespace:string, version:string): Promise<void>
}

export const TRANSFORMER = {
    CONFIG_PATHS_FILE: "tsconfig.paths.json"
}

export type PluginOptions = ts.CompilerOptions & {
    plugins?: PluginConfig[],
    onceIOR?: string,
}