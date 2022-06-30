import ts from "typescript";
import BuildConfig from "../../../3_services/Build/BuildConfig.interface.mjs";
import Transformer, { PluginOptions } from "../../../3_services/Build/Typescript/Transformer.interface.mjs";

export default class DefaultTransformer implements Transformer {
    config: ts.ParsedCommandLine;
    buildConfig: BuildConfig;
    static async init(baseDir: string, buildConfig: BuildConfig): Promise<Transformer> {
        const configFile = ts.findConfigFile(baseDir, ts.sys.fileExists);
        if (!configFile)
            throw Error(`no tsconfig file found in folder: ${baseDir}`);
        const { config } = ts.readConfigFile(configFile, ts.sys.readFile);
        const parsedConfig = ts.parseJsonConfigFileContent(config, ts.sys, baseDir);
        parsedConfig.options.noEmit = false;
        parsedConfig.options.outDir = buildConfig.distributionFolder;
        // (parsedConfig.options.plugins as PluginOptions) = buildConfig.transformer;


        return new DefaultTransformer(parsedConfig, buildConfig);
    }

    constructor(config: ts.ParsedCommandLine, buildConfig: BuildConfig) {
        this.config = config;
        this.buildConfig = buildConfig;
    }

    async transpile(): Promise<void> {
        const compilerHost = ts.createCompilerHost(this.config.options);
        const program = ts.createProgram(this.config.fileNames, this.config.options, compilerHost);
        const { diagnostics, emitSkipped } = program.emit();
        const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(diagnostics);
        if (allDiagnostics.length) {
            const formatHost: ts.FormatDiagnosticsHost = {
                getCanonicalFileName: (path) => path,
                getCurrentDirectory: ts.sys.getCurrentDirectory,
                getNewLine: () => ts.sys.newLine,
            }

            const message = ts.formatDiagnostics(allDiagnostics, formatHost);
            if (emitSkipped)
                console.error(message);
            else
                console.log(message);
        }
    }
}