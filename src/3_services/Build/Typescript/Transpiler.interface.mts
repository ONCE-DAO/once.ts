import ts, { PluginConfig } from "typescript"

export default interface Transpiler {
    watch(changedFunction: (files: string[]) => Promise<void>): Promise<void>
    transpile(): Promise<string[]>
    writeTsConfigPaths(files: string[], name: string, namespace: string, version: string): Promise<void>
    // extendIndexFile(files: string[]): Promise<void>
    writeComponentDescriptor(name: string, namespace: string, version: string, files: string[]): Promise<void>
    symLinkDistributionFolder(): void;
}

export const TRANSFORMER = {
    CONFIG_PATHS_FILE: "tsconfig.paths.json",
}

export type ExtendedOptions = ts.CompilerOptions & {
    plugins?: PluginConfig[],
    onceIOR?: string,
}