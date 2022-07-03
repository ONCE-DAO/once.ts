import { existsSync, readFileSync, writeFileSync } from "fs";
import path, { join, relative } from "path";
import ts from "typescript";
import DefaultUcpComponentDescriptor from "../../../2_systems/UCP/DefaultUcpComponentDescriptor.class.mjs";
import DefaultUcpUnit from "../../../2_systems/UCP/DefaultUcpUnit.class.mjs";
import BuildConfig from "../../../3_services/Build/BuildConfig.interface.mjs";
import Transpiler, { TRANSFORMER } from "../../../3_services/Build/Typescript/Transpiler.interface.mjs";
import { TYPESCRIPT_PROJECT } from "../../../3_services/Build/Typescript/TypescriptProject.interface.mjs";
import ClassDescriptorInterface from "../../../3_services/Thing/ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface from "../../../3_services/Thing/InterfaceDescriptor.interface.mjs";
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
        const exportFile = `${TYPESCRIPT_PROJECT.EXPORTS_FILE_NAME}.${this.ExportFileNameExtension.replace("t", "j")}`
        const descriptor = new DefaultUcpComponentDescriptor(name, namespace, version, exportFile, files
            .map(path => new DefaultUcpUnit(UnitType.File, join(".", relative(this.buildConfig.distributionFolder, path)))));
        writeFileSync(join(this.buildConfig.distributionFolder, `${name}.component.json`), JSON.stringify(descriptor, null, 2));
    }

    async extendIndexFile(files: string[]): Promise<void> {
        if (this.buildConfig.distributionFolder.includes("Transformer")) return;
        let exportList: string[] = [];
        let defaultExport: string = "";

        // let myFile = import.meta.url.replace(/^file:\/\//, '');
        for (const file of files) {

            //   const fileImport = baseDirectory + file.replace(/\.mts$/, '');
            const fileImport = file.replace(/\.mts$/, '');
            let moduleFile = path.relative(this.buildConfig.distributionFolder, fileImport);

            moduleFile = moduleFile.match(/^\./) ? moduleFile : "./" + moduleFile;
            let importedModule;
            try {
                importedModule = await import(fileImport)
            } catch (e) {
                console.log(e)
            }
            if (importedModule) {
                let exportedModuleItems = { ...importedModule };
                for (const itemKey of Object.keys(exportedModuleItems)) {
                    let item = exportedModuleItems[itemKey];
                    let descriptor: InterfaceDescriptorInterface | ClassDescriptorInterface | undefined;
                    if ("allExtendedInterfaces" in item) {
                        descriptor = item as InterfaceDescriptorInterface;

                    } else if ("classDescriptor" in item && item.classDescriptor) {
                        descriptor = item.classDescriptor as ClassDescriptorInterface;
                    }

                    if (descriptor && descriptor.componentExport && descriptor.componentExportName) {

                        let line = "import ";
                        line += itemKey === "default" ? descriptor.componentExportName : `{ ${itemKey} } `;
                        line += ` from "./${moduleFile}";\n`

                        // fs.writeSync(fd, line);

                        // Import Real Interface
                        // if ("allExtendedInterfaces" in item) {
                        //     let exportName = this._getInterfaceExportName(baseDirectory + file, item.name);

                        //     let interfaceLine = "import ";
                        //     interfaceLine += exportName === "default" ? item.name : `{ ${exportName} } `;
                        //     interfaceLine += ` from "./${moduleFile}";\n`
                        //     exportList.push(item.name);
                        //     fs.writeSync(fd, interfaceLine);

                        // }

                        if (descriptor.componentExport === "defaultExport") {
                            defaultExport = descriptor.componentExportName;
                        } else {
                            exportList.push(descriptor.componentExportName);
                        }

                    }
                }
            }
        }


        if (defaultExport) {
            let line = `export default ${defaultExport};\n`
            // fs.writeSync(fd, line);
        }
        if (exportList.length > 0) {
            let line = `export {${exportList.join(', ')}};\n`
            // fs.writeSync(fd, line);
        }

        // fs.writeSync(fd, "// ########## Generated Export END ##########\n");
        // fs.closeSync(fd);

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

        writeFileSync(this.tsconfigFilePath, JSON.stringify(config, null, 2))
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

        const host = ts.createWatchCompilerHost([...this.config.fileNames, this.ExportFileName], this.config.options, { ...ts.sys, write }, createProgram, this.reportDiagnostic, this.reportWatchStatusChanged)
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
        ts.sys.write(this.formatDiagnostics.bind(this)(diagnostic));
    }

    private reportWatchStatusChanged(diagnostic: ts.Diagnostic) {
        ts.sys.write(this.formatDiagnostics.bind(this)(diagnostic));
    }

    private static get formatHost(): ts.FormatDiagnosticsHost {
        return {
            getCanonicalFileName: (path) => path,
            getCurrentDirectory: ts.sys.getCurrentDirectory,
            getNewLine: () => ts.sys.newLine,
        }
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

    private get DefaultExportFileName() {
        return join(this.config.options.rootDir || "", `${TYPESCRIPT_PROJECT.DEFAULT_EXPORT_FILE}.${this.ExportFileNameExtension}`)

    }

    private readFile(fileName: string): string | undefined {
        return ts.sys.fileExists(fileName) ?
            ts.sys.readFile(fileName)
            : fileName === this.ExportFileName
                ? this.createExportFileContent()
                : undefined
    }

    private createExportFileContent(): string {
        let fileContent = "export {}\n"

        if (existsSync(this.DefaultExportFileName)) {
            fileContent += readFileSync(this.DefaultExportFileName).toString()
        }

        // let exportList: string[] = [];
        // let defaultExport: string = "";

        // let myFile = import.meta.url.replace(/^file:\/\//, '');
        // for (const file of files) {

        //     //   const fileImport = baseDirectory + file.replace(/\.mts$/, '');
        //     const fileImport = file.replace(/\.mts$/, '');
        //     let moduleFile = path.relative(path.parse(myFile).dir, path.join(fileImport));

        //     moduleFile = moduleFile.match(/^\./) ? moduleFile : "./" + moduleFile;
        //     let importedModule;
        //     try {
        //         let p = import(moduleFile)
        //         .then(importedModule => {
        //             console.log(importedModule);

        //         })
        //         p.catch(e => { 
        //             console.log(e) });



        //         // importedModule = await p;
        //     } catch (e) {
        //         console.log(e)
        //     }
        //       if (importedModule) {
        //         let exportedModuleItems = { ...importedModule };
        //         for (const itemKey of Object.keys(exportedModuleItems)) {
        //           let item = exportedModuleItems[itemKey];
        //           let descriptor: InterfaceDescriptorInterface | ClassDescriptorInterface | undefined;
        //           if ("allExtendedInterfaces" in item) {
        //             descriptor = item as InterfaceDescriptorInterface;

        //           } else if ("classDescriptor" in item && item.classDescriptor) {
        //             descriptor = item.classDescriptor as ClassDescriptorInterface;
        //           }

        //           if (descriptor && descriptor.componentExport && descriptor.componentExportName) {

        //             let line = "import ";
        //             line += itemKey === "default" ? descriptor.componentExportName : `{ ${itemKey} } `;
        //             line += ` from "./${moduleFile}";\n`

        //             fs.writeSync(fd, line);

        //             // Import Real Interface
        //             if ("allExtendedInterfaces" in item) {
        //               let exportName = this._getInterfaceExportName(baseDirectory + file, item.name);

        //               let interfaceLine = "import ";
        //               interfaceLine += exportName === "default" ? item.name : `{ ${exportName} } `;
        //               interfaceLine += ` from "./${moduleFile}";\n`
        //               exportList.push(item.name);
        //               fs.writeSync(fd, interfaceLine);

        //             }

        //             if (descriptor.componentExport === "defaultExport") {
        //               defaultExport = descriptor.componentExportName;
        //             } else {
        //               exportList.push(descriptor.componentExportName);
        //             }

        //           }
        //         }
        //       }
        // }


        // if (defaultExport) {
        //   let line = `export default ${defaultExport};\n`
        //   fs.writeSync(fd, line);
        // }
        // if (exportList.length > 0) {
        //   let line = `export {${exportList.join(', ')}};\n`
        //   fs.writeSync(fd, line);
        // }

        // fs.writeSync(fd, "// ########## Generated Export END ##########\n");
        // fs.closeSync(fd);


        return fileContent;
    }
}

type ConfigJsonFile = { compilerOptions: ts.CompilerOptions };
