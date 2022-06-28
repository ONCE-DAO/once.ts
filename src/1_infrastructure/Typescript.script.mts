import { existsSync, rm, rmSync, symlinkSync } from "fs";
import { join } from "path";
import ts from "typescript";
function createCompilerHost(options: ts.CompilerOptions): ts.CompilerHost {
  return {
    getSourceFile,
    getDefaultLibFileName: () => "lib.d.ts",
    writeFile: (fileName, content) => ts.sys.writeFile(fileName, content),
    getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
    getDirectories: path => ts.sys.getDirectories(path),
    getCanonicalFileName: fileName =>
      ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
    getNewLine: () => ts.sys.newLine,
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
    fileExists,
    readFile,
    resolveModuleNames
  };

  function fileExists(fileName: string): boolean {
    return ts.sys.fileExists(fileName);
  }

  function readFile(fileName: string): string | undefined {
    return ts.sys.readFile(fileName);
  }

  function resolveModuleNames(
    moduleNames: string[],
    containingFile: string
  ): ts.ResolvedModule[] {
    const resolvedModules: ts.ResolvedModule[] = [];
    for (const moduleName of moduleNames) {
      // try to use standard resolution
      let result = ts.resolveModuleName(moduleName, containingFile, options, {
        fileExists,
        readFile
      });
      if (result.resolvedModule) {
        resolvedModules.push(result.resolvedModule);
      }
      // else {
      //   // check fallback locations, for simplicity assume that module at location
      //   // should be represented by '.d.ts' file
      //   for (const location of moduleSearchLocations) {
      //     const modulePath = path.join(location, moduleName + ".d.ts");
      //     if (fileExists(modulePath)) {
      //       resolvedModules.push({ resolvedFileName: modulePath });
      //     }
      //   }
      // }
    }
    return resolvedModules;
  }
}



function getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) {

  const sourceText = fileName.endsWith('foo.mts') ? `export const foo = 4;import DefaultIOR from "./2_systems/Things/DefaultIOR.class.mjs";
  import { BaseNodeOnce } from "./2_systems/Once/BaseOnce.class.mjs";
  import { OnceMode, OnceState } from "./3_services/Once.interface.mjs";
  export { DefaultIOR, BaseNodeOnce, OnceMode, OnceState };` : ts.sys.readFile(fileName);
  return sourceText !== undefined
    ? ts.createSourceFile(fileName, sourceText, languageVersion)
    : undefined;
}


function compile(sourceFiles: string[], dir: string, options: ts.CompilerOptions, ignoreErrors: boolean): void {
  const h = ts.createCompilerHost(options)
  h.getSourceFile = getSourceFile
  sourceFiles.push(join(dir, "src", "foo.mts"))
  const program = ts.createProgram(sourceFiles, options, h);

  const { diagnostics, emitSkipped } = program.emit()
  try {

    existsSync(join(dir, "node_modules")) && !existsSync(join(options.outDir || "", "node_modules")) && symlinkSync(join(dir, "node_modules"), join(options.outDir || "", "node_modules"))
  }
  catch { }

  if (!ignoreErrors) {

    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(diagnostics)

    if (allDiagnostics.length) {
      const formatHost: ts.FormatDiagnosticsHost = {
        getCanonicalFileName: (path) => path,
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getNewLine: () => ts.sys.newLine,
      }


      if (emitSkipped) {
        // options.outDir && existsSync(options.outDir) && rmSync(options.outDir)
        const message = ts.formatDiagnostics(allDiagnostics, formatHost)
        console.error(message)
      }
    }
  }
}

function compileModule(dir: string, ignoreErrors = false, deleteOutDir = false) {
  const configFile = ts.findConfigFile(dir, ts.sys.fileExists, 'tsconfig.build.json')
  if (!configFile) throw Error(dir + 'tsconfig.build.json not found ')
  const { config } = ts.readConfigFile(configFile, ts.sys.readFile)
  const { options, fileNames, errors } = ts.parseJsonConfigFileContent(config, ts.sys, dir)
  options.noEmitOnError = !ignoreErrors;

  //TODO Make it dynamic
  (options as PluginOptions).onceIOR = "ior:esm:/tla.EAM.Once[dev]";

  const transformerPath = "./Scenarios/localhost/tla/EAM/Thinglish/Transformer/merge/3_services/transformer.cjs"
  if (!dir.includes("thinglish.transformer"))
    (options as PluginOptions).plugins = [{ transform: transformerPath }]

  deleteOutDir && options.outDir && existsSync(options.outDir) && rmSync(options.outDir, { recursive: true })
  compile(fileNames, dir, options, ignoreErrors)
}

type PluginOptions = ts.CompilerOptions & {
  plugins?: { transform: string }[],
  onceIOR?: string,
}

const moduleDirs = [
  "./Components/tla/EAM/Thinglish/Transformer/thinglish.transformer@merge",
  "./Components/tla/EAM/Once/once@dev",
  "./Components/tla/EAM/Once/Server/once.server@dev"
]
existsSync("./Scenarios/localhost") && rmSync("./Scenarios/localhost", { recursive: true })
moduleDirs.forEach(dir => compileModule(dir, true))





