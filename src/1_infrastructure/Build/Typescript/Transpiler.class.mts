import { existsSync, rmSync, symlinkSync } from "fs";
import { join, relative } from "path";
import ts from "typescript";
import DefaultUcpUnit from "../../../2_systems/UCP/DefaultUcpUnit.class.mjs";
import ExportUcpComponentDescriptor from "../../../2_systems/UCP/ExportUcpComponentDescriptor.mjs";
import BuildConfig from "../../../3_services/Build/BuildConfig.interface.mjs";
import Transpiler, { ExtendedOptions, PluginConfig, TRANSFORMER } from "../../../3_services/Build/Typescript/Transpiler.interface.mjs";
import { TYPESCRIPT_PROJECT } from "../../../3_services/Build/Typescript/TypescriptProject.interface.mjs";
import { UnitType } from "../../../3_services/UCP/UcpUnit.interface.mjs";

export default class DefaultTranspiler implements Transpiler {
    private config: ts.ParsedCommandLine;
    private buildConfig: BuildConfig;
    private incremental: boolean = false;


    static async init(baseDir: string, buildConfig: BuildConfig, namespace: string): Promise<Transpiler> {
        const configFile = ts.findConfigFile(baseDir, ts.sys.fileExists, "tsconfig.build.json");
        if (!configFile)
            throw Error(`no tsconfig file found in folder: ${baseDir}`);
        return new DefaultTranspiler(buildConfig, configFile, baseDir, namespace);
    }

    constructor(buildConfig: BuildConfig, configFile: string, private baseDir: string, private namespace: string) {
        this.buildConfig = buildConfig;
        this.config = this.parseConfig(configFile, buildConfig);
    }

    symLinkDistributionFolder(): void {
        const path = join(this.baseDir, "dist");
        if (existsSync(path)) rmSync(path, { recursive: true });

        if (existsSync(this.buildConfig.distributionFolder)) {
            symlinkSync(this.buildConfig.distributionFolder, path);
        }
    }

    private parseConfig(configFile: string, buildConfig: BuildConfig) {
        const readConfig = ts.readConfigFile(configFile, ts.sys.readFile);
        const parsedConfig = ts.parseJsonConfigFileContent(readConfig.config, ts.sys, this.baseDir);

        const options = parsedConfig.options as ExtendedOptions;
        if (!options.rootDir) throw "root dir is not set in " + configFile
        options.noEmit = false;
        options.outDir = parsedConfig.options.outDir ?? buildConfig.distributionFolder;
        options.preserveWatchOutput = true;
        options.listEmittedFiles = true;

        options.plugins = options.plugins?.map(plugin => {
            const pluginConfig: PluginConfig = {
                ...plugin,
                transform: join(buildConfig.eamdPath, plugin.transform || "")
            }
            return pluginConfig
        })


        // TODO can be removed when path linking to real .mts files
        // options.noEmitOnError = false
        options.tsBuildInfoFile = buildConfig.distributionFolder + "/.tsbuildinfo";
        options.noEmitOnError = existsSync(options.tsBuildInfoFile)
        // options.noEmitOnError = false;

        // TODO can be remove when exclude will work
        options.suppressOutputPathCheck = true;
        parsedConfig.options = options;
        return parsedConfig;
    }

    async writeComponentDescriptor(name: string, namespace: string, version: string, files: string[]): Promise<void> {
        if (this.incremental) {
            console.error("incremental descriptor not implemented yet");
            return;

        }
        const exportsFile = `${TYPESCRIPT_PROJECT.EXPORTS_FILE_NAME}.${this.ExportFileNameExtension.replace("t", "j")}`
        let componentDescriptorFile = join(this.buildConfig.distributionFolder, `${name}.component.json`)
        let exports: any = {};
        if (ts.sys.fileExists(componentDescriptorFile)) {
            let rawString = ts.sys.readFile(componentDescriptorFile)?.toString();
            if (rawString) exports = JSON.parse(rawString)?.exports;
        }
        const descriptor = new ExportUcpComponentDescriptor(
            {
                name, namespace, version, exports, exportsFile, units: files
                    .map(path => new DefaultUcpUnit(UnitType.File, join(".", relative(this.buildConfig.distributionFolder, path))))
            }
        );
        ts.sys.writeFile(componentDescriptorFile, JSON.stringify(descriptor, null, 2));
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
        // else {
        //     !this.incremental && delete config.compilerOptions.paths[`ior:esm:/${namespace}.${name}[${version}]`]
        // }

        ts.sys.writeFile(this.tsconfigFilePath, JSON.stringify(config, null, 2))
    }

    readDirectory(rootDir: string, extensions: readonly string[], excludes: readonly string[] | undefined, includes: readonly string[], depth?: number): string[] {
        return ts.sys.readDirectory(rootDir, extensions, excludes, includes, depth);
    }

    async transpile(): Promise<string[]> {
        const compilerHost = ts.createCompilerHost(this.config.options);
        compilerHost.readFile = this.readFile.bind(this)

        compilerHost.readDirectory = this.readDirectory.bind(this)

        const program = ts.createProgram({
            rootNames: [...this.config.fileNames, this.ExportFileName],
            options: this.config.options,
            projectReferences: [],
            host: compilerHost,
            oldProgram: undefined,
            configFileParsingDiagnostics: this.config.errors
        })
        const writeFile = (path: string, data: string, writeByteOrderMark?: boolean) => {
            try {
                ts.sys.writeFile(path, data, writeByteOrderMark);
            } catch (e) {
                console.log(e);

            }
        }
        const emitResult = program.emit(undefined, writeFile);

        const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
        if (emitResult.emitSkipped) {
            console.log(this.formatDiagnostics.bind(this)(allDiagnostics));
            console.error('\x1b[31m%s\x1b[0m', "Emit was skipped. please check errors");
            throw "Emit was skipped. please check errors"
        }

        return emitResult.emittedFiles || []
    }

    async watch(changedFunction: (files: string[]) => Promise<void>): Promise<void> {
        const createProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram;

        const write = function (s: string) {
            if (s.startsWith("TSFILE:")) return;
            console.log(s)
        }

        const host = ts.createWatchCompilerHost(
            [...this.config.fileNames, this.ExportFileName],
            this.config.options,
            { ...ts.sys, write },
            createProgram,
            this.reportDiagnostic.bind(this),
            this.reportWatchStatusChanged.bind(this)
        )
        host.readFile = this.readFile.bind(this)

        // You can technically override any given hook on the host, though you probably don't need to.
        // Note that we're assuming `origCreateProgram` and `origPostProgramCreate` doesn't use `this` at all.

        const origCreateProgram = host.createProgram;
        host.createProgram = (rootNames, options, host, oldProgram) => {
            console.log("** We're about to create the program! **");
            this.incremental = oldProgram !== undefined;
            if (this.incremental && options) {
                options.noEmitOnError = true;
            }
            return origCreateProgram(rootNames, options, host, oldProgram);
        };

        const origPostProgramCreate = host.afterProgramCreate;
        host.afterProgramCreate = program => {
            // if (firstCreateProgram) {
            const oldemit = program.emit
            program.emit = (targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers) => {
                const emitResult = oldemit?.(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);
                if (emitResult?.emittedFiles)
                    changedFunction(emitResult.emittedFiles)
                return emitResult
            }
            // }
            console.log("** We finished making the program! **");
            origPostProgramCreate!(program);
        };

        // `createWatchProgram` creates an initial program, watches files, and updates the program over time.
        ts.createWatchProgram(host);
    }

    private formatDiagnostics(diagnostics: ts.Diagnostic[] | ts.Diagnostic, formatHost = DefaultTranspiler.formatHost) {
        return `DefaultCustomTranspiler: ${this.namespace}\n${Array.isArray(diagnostics) ?
            ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost)
            : ts.formatDiagnosticsWithColorAndContext([diagnostics], formatHost)}`
    }

    private reportDiagnostic(diagnostic: ts.Diagnostic) {
        if (this)
            ts.sys.write(this.formatDiagnostics.bind(this)(diagnostic));
    }

    private reportWatchStatusChanged(diagnostic: ts.Diagnostic) {
        ts.sys.write(this.formatDiagnostics(diagnostic));
    }

    private static get formatHost(): ts.FormatDiagnosticsHost {
        return {
            getCanonicalFileName: (path) => path,
            getCurrentDirectory: ts.sys.getCurrentDirectory,
            getNewLine: () => ts.sys.newLine,
        }
    }

    private get pathsConfig() {
        existsSync(this.tsconfigFilePath) || ts.sys.writeFile(this.tsconfigFilePath, this.defaultPathFile)
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

    private get DefaultExportFileName() {
        return join(this.config.options.rootDir || "", `${TYPESCRIPT_PROJECT.DEFAULT_EXPORT_FILE}.${this.ExportFileNameExtension}`)
    }

    private readFile(fileName: string): string | undefined {
        if (ts.sys.fileExists(fileName)) {
            return ts.sys.readFile(fileName);
        }
        else {
            return this.createExportFileContent();
        }
    }

    private createExportFileContent(): string {
        let fileContent = "export {}\n"

        if (existsSync(this.DefaultExportFileName)) {
            fileContent += ts.sys.readFile(this.DefaultExportFileName)
        }
        return fileContent;
    }
}

type ConfigJsonFile = { compilerOptions: ts.CompilerOptions };
