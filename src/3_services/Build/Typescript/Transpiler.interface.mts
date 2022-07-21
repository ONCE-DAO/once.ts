import ts from "typescript"
import NpmPackageInterface from "../Npm/NpmPackage.interface.mjs"

export default interface Transpiler {
    watch(changedFunction: (files: string[]) => Promise<void>): Promise<void>
    transpile(): Promise<string[]>
    writeTsConfigPaths(files: string[], name: string, namespace: string, version: string): Promise<void>
    writeTsConfigBuildPaths(files: string[], name: string, namespace: string, version: string): Promise<void>
    // extendIndexFile(files: string[]): Promise<void>
    writeComponentDescriptor(name: string, namespace: string, version: string, files: string[]): Promise<void>
    writeSourceIndexFile(): Promise<void>
    symLinkDistributionFolder(): void;
}

export const TRANSFORMER = {
    CONFIG_PATHS_FILE: "tsconfig.paths.json",
    CONFIG_BUILD_PATHS_FILE: "tsconfig.build.paths.json",
}

export type ExtendedOptions = ts.CompilerOptions & {
    plugins?: PluginConfig[],
    onceIOR?: string,
}

export interface PluginConfig {
    [x: string]: any;
    name?: string;
    transform?: string;
    tsConfig?: string;
    import?: string;
    type?: 'ls' | 'program' | 'config' | 'checker' | 'raw' | 'compilerOptions';
    after?: boolean;
    afterDeclarations?: boolean;
    transformProgram?: boolean;
    beforeEmit?: boolean;
}