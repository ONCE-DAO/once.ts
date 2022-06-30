import { existsSync, writeFileSync } from "fs";
import { join, relative } from "path";
import ts from "typescript";
import BuildConfig from "../../../3_services/Build/BuildConfig.interface.mjs";
import Transformer, { PluginOptions, TRANSFORMER } from "../../../3_services/Build/Typescript/Transformer.interface.mjs";
import { TYPESCRIPT_PROJECT } from "../../../3_services/Build/Typescript/TypescriptProject.interface.mjs";
export default class DefaultTransformer implements Transformer {
    config: ts.ParsedCommandLine;
    buildConfig: BuildConfig;

    static async init(baseDir: string, buildConfig: BuildConfig): Promise<Transformer> {

        const configFile = ts.findConfigFile(baseDir, ts.sys.fileExists);
        if (!configFile)
            throw Error(`no tsconfig file found in folder: ${baseDir}`);
        const readConfig = ts.readConfigFile(configFile, ts.sys.readFile);
        const parsedConfig = ts.parseJsonConfigFileContent(readConfig.config, ts.sys, baseDir);
        parsedConfig.options.noEmit = false;
        // parsedConfig.options.noEmitOnError = false;
        parsedConfig.options.outDir = buildConfig.distributionFolder;
        (parsedConfig.options as any).listEmittedFiles = true;
        (parsedConfig.options as PluginOptions).plugins = buildConfig.transformer;
        return new DefaultTransformer(parsedConfig, buildConfig);
    }

    constructor(config: ts.ParsedCommandLine, buildConfig: BuildConfig) {
        this.config = config;
        this.buildConfig = buildConfig;
    }


    async writeTsConfigPaths(files: string[], name: string, namespace: string, version: string): Promise<void> {
        let config = this.pathsConfig;
        if (!config.compilerOptions.paths) config.compilerOptions.paths = {}
        const d = ".d."
        let exportFiles = files
            .filter(file => file.includes(TYPESCRIPT_PROJECT.EXPORTS_FILE_NAME))
            .map(file => relative(this.buildConfig.eamdPath, file))
            .sort((a, b) =>
                a.includes(d) ?
                    b.includes(d) ? 0 : -1 :
                    b.includes(d) ? 1 : 0)

        if (exportFiles.length) {
            config.compilerOptions.paths[`ior:esm:/${namespace}.${name}[${version}]`] = exportFiles
        }
        else {
            delete config.compilerOptions.paths[`ior:esm:/${namespace}.${name}[${version}]`]
        }

        writeFileSync(this.tsconfigFilePath, JSON.stringify(config, null, 2))
    }

    async transpile(): Promise<string[]> {
        const compilerHost = ts.createCompilerHost(this.config.options);
        compilerHost.getSourceFile = this.getSourceFile.bind(this)
        const program = ts.createProgram([...this.config.fileNames, this.ExportFileName], this.config.options, compilerHost);
        const emitResult = program.emit();
        const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
        if (allDiagnostics.length) {
            const formatHost: ts.FormatDiagnosticsHost = {
                getCanonicalFileName: (path) => path,
                getCurrentDirectory: ts.sys.getCurrentDirectory,
                getNewLine: () => ts.sys.newLine,
            }

            const message = ts.formatDiagnostics(allDiagnostics, formatHost);
            if (emitResult.emitSkipped)
                console.error(message);
            else
                console.error(message);
        }

        let exitCode = emitResult.emitSkipped ? 1 : 0;
        console.log(`Process exiting with code '${exitCode}'.`);
        exitCode && process.exit(exitCode);
      
        return emitResult.emittedFiles || []
    }

    private get pathsConfig() {
        existsSync(this.tsconfigFilePath) || writeFileSync(this.tsconfigFilePath, this.defaultPathFile)
        let configFile = ts.findConfigFile(this.buildConfig.eamdPath, ts.sys.fileExists, TRANSFORMER.CONFIG_PATHS_FILE);
        if (!configFile) throw `${TRANSFORMER.CONFIG_PATHS_FILE} not found in ${this.buildConfig.eamdPath}`
        const readResult = ts.readConfigFile(configFile, ts.sys.readFile);
        if (!readResult.config) throw readResult.error
        return readResult.config as ConfigJsonFile;
    }

    private get defaultPathFile() {
        const config: ConfigJsonFile = {
            compilerOptions: {
                baseUrl: ".",
                paths: {}
            }
        }
        return JSON.stringify(config, null, 2)
    }

    private get tsconfigFilePath() {
        return join(this.buildConfig.eamdPath, TRANSFORMER.CONFIG_PATHS_FILE)
    }

    private get ExportFileName() {
        return join(this.config.options.rootDir || "", `${TYPESCRIPT_PROJECT.EXPORTS_FILE_NAME}.${this.ExportFileNameExtension}`)
    }

    private get ExportFileNameExtension() {
        const module = this.config.options.module as Number;
        if (module === ts.ModuleKind.CommonJS)
            return "cts";
        if (module >= ts.ModuleKind.ES2015 && module <= ts.ModuleKind.ESNext)
            return "mts";
        return "ts";
    }

    private getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile | undefined {
        const sourceText = this.getSourceText(fileName)
        if (sourceText)
            return ts.createSourceFile(fileName, sourceText, languageVersion)
        return undefined
    }

    private getSourceText(fileName: string): string | undefined {
        return ts.sys.fileExists(fileName) ?
            ts.sys.readFile(fileName)
            : fileName === this.ExportFileName
                ? this.createExportFileContent()
                : undefined
    }

    private createExportFileContent() {
        return "export const answer=42;"
    }
}

type ConfigJsonFile = { compilerOptions: ts.CompilerOptions };
