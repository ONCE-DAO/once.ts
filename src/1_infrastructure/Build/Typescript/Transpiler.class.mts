import { existsSync, readFileSync, writeFileSync } from "fs";
import path, { extname, join, relative } from "path";
import ts from "typescript";
import DefaultUcpComponentDescriptor from "../../../2_systems/UCP/DefaultUcpComponentDescriptor.class.mjs";
import DefaultUcpUnit from "../../../2_systems/UCP/DefaultUcpUnit.class.mjs";
import BuildConfig from "../../../3_services/Build/BuildConfig.interface.mjs";
import Transpiler, { PluginOptions, TRANSFORMER } from "../../../3_services/Build/Typescript/Transpiler.interface.mjs";
import { TYPESCRIPT_PROJECT } from "../../../3_services/Build/Typescript/TypescriptProject.interface.mjs";
import ClassDescriptorInterface from "../../../3_services/Thing/ClassDescriptor.interface.mjs";
import InterfaceDescriptorInterface from "../../../3_services/Thing/InterfaceDescriptor.interface.mjs";
import { UnitType } from "../../../3_services/UCP/UcpUnit.interface.mjs";
export default class DefaultTranspiler implements Transpiler {
    config: ts.ParsedCommandLine;
    buildConfig: BuildConfig;

    static async init(baseDir: string, buildConfig: BuildConfig): Promise<Transpiler> {

        const configFile = ts.findConfigFile(baseDir, ts.sys.fileExists);
        if (!configFile)
            throw Error(`no tsconfig file found in folder: ${baseDir}`);
        const readConfig = ts.readConfigFile(configFile, ts.sys.readFile);
        const parsedConfig = ts.parseJsonConfigFileContent(readConfig.config, ts.sys, baseDir);
        parsedConfig.options.noEmit = false;
        parsedConfig.options.noEmitOnError = false;
        parsedConfig.options.outDir = buildConfig.distributionFolder;
        (parsedConfig.options as any).listEmittedFiles = true;
        // deactivated transformer
        // if (!buildConfig.distributionFolder.includes("Transformer"))
        //     (parsedConfig.options as PluginOptions).plugins = buildConfig.transformer;
        return new DefaultTranspiler(parsedConfig, buildConfig);
    }

    constructor(config: ts.ParsedCommandLine, buildConfig: BuildConfig) {
        this.config = config;
        this.buildConfig = buildConfig;
    }

    async writeComponentDescriptor(name: string, namespace: string, version: string, files: string[]): Promise<void> {
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

    private get DefaultExportFileName() {
        return join(this.config.options.rootDir || "", `${TYPESCRIPT_PROJECT.DEFAULT_EXPORT_FILE}.${this.ExportFileNameExtension}`)

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
        if (this.buildConfig.distributionFolder.includes("Transformer")) return
        const files = this.config.fileNames
        let fileContent = "export {}\n"



        if (existsSync(this.DefaultExportFileName)) {
            fileContent += readFileSync(this.DefaultExportFileName).toString()
        }

        console.log(fileContent);

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
