import { execSync } from "child_process";
import { existsSync, rm, rmSync, symlinkSync } from "fs";
import { join, relative } from "path";
import ts from "typescript";
import Scenario from "../2_systems/Scenario.class.mjs";
import EAMD from "./EAMD.class.mjs";

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

function updateTsConfig(dir: string, outDir: string, tsConfig: ts.CompilerOptions): ts.CompilerOptions {
  tsConfig.rootDir = join(dir, "src")
  tsConfig.outDir = outDir;
  return tsConfig;
}

function compileModule(dir: string, outDir: string, ignoreErrors = false, deleteOutDir = false) {
  console.log("start compiling ", dir);

  if (process.env.fullBuild === "true") {
    execSync("npm i", {
      cwd: dir,
      stdio: "inherit"
    })
  }

  const configFile = ts.findConfigFile(dir, ts.sys.fileExists, 'tsconfig.json')
  if (!configFile) throw Error('tsconfig.json not found')

  const { config } = ts.readConfigFile(configFile, ts.sys.readFile)
  config.include = [join(dir, "src")]
  const { options, fileNames, errors } = ts.parseJsonConfigFileContent(config, ts.sys, dir)
  options.noEmitOnError = !ignoreErrors;

  //TODO Make it dynamic
  (options as PluginOptions).onceIOR = "ior:esm:/tla.EAM.Once[dev]";

  const transformerPath = join(process.cwd(), "Scenarios/localhost/webroot/tla/EAM/Thinglish/Transformer/merge/3_services/transformer.cjs")
  if (!dir.includes("thinglish.transformer") && existsSync("Scenarios/localhost/webroot/tla/EAM/Thinglish/Transformer/merge/3_services/transformer.cjs")) {
    execSync("npx ts-patch i", { cwd: dir });
    (options as PluginOptions).plugins = [{ transform: transformerPath }]
  }

  const updatedOptions = updateTsConfig(dir, outDir, options)


  deleteOutDir && updatedOptions.outDir && existsSync(updatedOptions.outDir) && rmSync(updatedOptions.outDir, { recursive: true })
  compile(fileNames, dir, updatedOptions, ignoreErrors)
}

type PluginOptions = ts.CompilerOptions & {
  plugins?: { transform: string }[],
  onceIOR?: string,
}

const eamd = await EAMD.getInstance(Scenario.Default)
existsSync("./Scenarios/localhost") && rmSync("./Scenarios/localhost", { recursive: true })
eamd.createPathsConfig()
eamd.runForSubmodules(async(submodule) => {
  await compileModule(join(submodule.basePath, submodule.path), join(submodule.distributionFolder), true);
})