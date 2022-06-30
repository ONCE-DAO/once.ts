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
        parsedConfig.options.noEmitOnError = false;
        parsedConfig.options.outDir = buildConfig.distributionFolder;
        (parsedConfig.options as any).listEmittedFiles = true;
        (parsedConfig.options as PluginOptions).plugins = buildConfig.transformer;
        return new DefaultTransformer(parsedConfig, buildConfig);
    }

    constructor(config: ts.ParsedCommandLine, buildConfig: BuildConfig) {
        this.config = config;
        this.buildConfig = buildConfig;
    }


    async writeConfigPaths(files: string[], name: string, namespace: string, version: string): Promise<void> {
        let config = this.pathsConfig;
        if (!config.compilerOptions.paths) config.compilerOptions.paths = {}

        let exportFiles = files
            .filter(file => file.includes(TYPESCRIPT_PROJECT.EXPORTS_FILE_NAME))
            .map(file => relative(this.buildConfig.eamdPath, file))

        config.compilerOptions.paths[`ior:esm:/${namespace}.${name}[${version}]`] = exportFiles
        writeFileSync(this.tsconfigFilePath, JSON.stringify(config, null, 2))
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

    //   private async createPathsConfig(submodules?: GitRepositorySubmodule[]) {
    //     if (submodules === undefined) {
    //       submodules = await this.getSortedSubmodules();
    //     }
    //     const fileName = "tsconfigPaths.json"

    //     let data = {
    //       "compilerOptions": {
    //         "baseUrl": ".",
    //         "paths": {} as { [key: string]: string[] }
    //       }
    //     };

    //     for (const submodule of submodules) {
    //       const ior = `ior:esm:/${submodule.package.packageJson.namespace}.${submodule.package.packageJson.name}[${submodule.branch}]`;
    //       if (submodule.package.packageJson.main === undefined) throw new Error("Missing main in Package.json in " + submodule.folderPath);
    //       let modulePath = join(submodule.distributionFolder, submodule.package.packageJson.main.replace("dist/", ""));
    //       const value: string[] = [modulePath];

    //       if (submodule.package.packageJson.types !== undefined) {
    //         value.unshift(join(submodule.distributionFolder, submodule.package.packageJson.types));
    //       } else if (submodule.package.packageJson.main.endsWith('.mjs')) {
    //         value.unshift(join(submodule.distributionFolder, submodule.package.packageJson.main.replace("dist/", "").replace(/\.m[jt]s$/, '.d.mts')));
    //       }
    //       data.compilerOptions.paths[ior] = value;
    //     }

    //     writeFileSync(fileName, JSON.stringify(data, null, 2), { encoding: 'utf8' });

    //   }


    async transpile(): Promise<string[]> {
        const compilerHost = ts.createCompilerHost(this.config.options);
        const program = ts.createProgram(this.config.fileNames, this.config.options, compilerHost);
        const emit = program.emit();
        const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emit.diagnostics);
        if (allDiagnostics.length) {
            const formatHost: ts.FormatDiagnosticsHost = {
                getCanonicalFileName: (path) => path,
                getCurrentDirectory: ts.sys.getCurrentDirectory,
                getNewLine: () => ts.sys.newLine,
            }

            const message = ts.formatDiagnostics(allDiagnostics, formatHost);
            if (emit.emitSkipped)
                console.error(message);
            else
                console.log(message);
        }
        return emit.emittedFiles || []
    }
}

type ConfigJsonFile = { compilerOptions: ts.CompilerOptions };
