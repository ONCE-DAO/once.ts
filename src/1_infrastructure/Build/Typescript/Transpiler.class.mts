import { existsSync } from "fs";
import { join, relative } from "path";
import ts from "typescript";
import DefaultUcpComponentDescriptor from "../../../2_systems/UCP/DefaultUcpComponentDescriptor.class.mjs";
import DefaultUcpUnit from "../../../2_systems/UCP/DefaultUcpUnit.class.mjs";
import ExportUcpComponentDescriptor from "../../../2_systems/UCP/ExportUcpComponentDescriptor.mjs";
import BuildConfig from "../../../3_services/Build/BuildConfig.interface.mjs";
import Transpiler, { TRANSFORMER } from "../../../3_services/Build/Typescript/Transpiler.interface.mjs";
import { TYPESCRIPT_PROJECT } from "../../../3_services/Build/Typescript/TypescriptProject.interface.mjs";
import { UnitType } from "../../../3_services/UCP/UcpUnit.interface.mjs";

export default class DefaultTranspiler implements Transpiler {
    private config: ts.ParsedCommandLine;
    private buildConfig: BuildConfig;
    private incremental: boolean = false;


    static async init(baseDir: string, buildConfig: BuildConfig, namespace: string): Promise<Transpiler> {
        const configFile = ts.findConfigFile(baseDir, ts.sys.fileExists);
        if (!configFile)
            throw Error(`no tsconfig file found in folder: ${baseDir}`);
        return new DefaultTranspiler(buildConfig, configFile, baseDir, namespace);
    }

    constructor(buildConfig: BuildConfig, configFile: string, private baseDir: string, private namespace: string) {
        this.buildConfig = buildConfig;
        this.config = this.parseConfig(configFile, buildConfig);
    }

    private parseConfig(configFile: string, buildConfig: BuildConfig) {
        const readConfig = ts.readConfigFile(configFile, ts.sys.readFile);
        const parsedConfig = ts.parseJsonConfigFileContent(readConfig.config, ts.sys, this.baseDir);
        parsedConfig.options.noEmit = false;

        parsedConfig.options.outDir = buildConfig.distributionFolder;
        parsedConfig.options.preserveWatchOutput = true;
        (parsedConfig.options as any).listEmittedFiles = true;

        // TODO can be removed when path linking to real .mts files
        parsedConfig.options.noEmitOnError = false;
        // TODO can be remove when exclude will work
        parsedConfig.options.suppressOutputPathCheck = true;
        return parsedConfig;
    }

    async writeComponentDescriptor(name: string, namespace: string, version: string, files: string[]): Promise<void> {
        if (this.incremental) {
            console.error("incremental descriptor not implemented yet");
            return;

        }
        const exportsFile = `${TYPESCRIPT_PROJECT.EXPORTS_FILE_NAME}.${this.ExportFileNameExtension.replace("t", "j")}`
        const descriptor = new ExportUcpComponentDescriptor(
            {
                name, namespace, version, exportsFile, units: files
                    .map(path => new DefaultUcpUnit(UnitType.File, join(".", relative(this.buildConfig.distributionFolder, path))))
            }
        );
        ts.sys.writeFile(join(this.buildConfig.distributionFolder, `${name}.component.json`), JSON.stringify(descriptor, null, 2));
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
            !this.incremental && delete config.compilerOptions.paths[`ior:esm:/${namespace}.${name}[${version}]`]
        }

        ts.sys.writeFile(this.tsconfigFilePath, JSON.stringify(config, null, 2))
    }

    readDirectory(rootDir: string, extensions: readonly string[], excludes: readonly string[] | undefined, includes: readonly string[], depth?: number): string[] {
        return ts.sys.readDirectory(rootDir, extensions, excludes, includes, depth);
    }

    async transpile(): Promise<string[]> {
        const compilerHost = ts.createCompilerHost(this.config.options);
        compilerHost.readFile = this.readFile.bind(this)

        // const oldReadDirectory = compilerHost.readDirectory
        compilerHost.readDirectory = this.readDirectory.bind(this)

        // const program = ts.createProgram([...this.config.fileNames, this.ExportFileName], this.config.options, compilerHost);
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


        if (emitResult.emitSkipped) {
            const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
            if (allDiagnostics.length) {
                console.log(this.formatDiagnostics.bind(this)(allDiagnostics));
            }

            console.error('\x1b[31m%s\x1b[0m', "Emit was skipped. please check errors");
            console.log("tsconfig", JSON.stringify(this.config.options, null, 2));
            console.log("outdir", JSON.stringify(this.config.options.outDir, null, 2));
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
