// import { DefaultGitRepository } from "./GitRepository.class.mjs";
// import { join, relative } from "path";
// import { execSync, spawn } from "child_process";
// import Submodule from "../3_services/Submodule.interface.mjs";
// import { DefaultNpmPackage } from "./NpmPackage.class.mjs";
// import { cpSync, existsSync, mkdirSync, rmdirSync, rmSync, symlinkSync, unlink, unlinkSync, writeFileSync, readFileSync, readdirSync, statSync } from 'fs';
// import simpleGit, { SimpleGit } from "simple-git";
// import GitRepository, {
//   GitRepositoryParameter,
//   NotAGitRepositoryError,
// } from "../3_services/GitRepository.interface.mjs";
// import UcpComponentDescriptor from "./Things/BaseUcpComponentDescriptor.class.mjs";
// import ServerSideUcpComponentDescriptor from "./Things/ServerSideUcpComponentDescriptor.class.mjs";
// // import * as ts from "typescript"
// export default class DefaultSubmodule
//   extends DefaultGitRepository
//   implements Submodule, GitRepository {
//   name: string;
//   path: string;
//   url: string;
//   branch: string;
//   basePath: string;
//   package: DefaultNpmPackage;
//   distributionFolder: string = "dist";

//   static ResolveDependencies(
//     a: Submodule & GitRepository,
//     b: Submodule & GitRepository
//   ): number {
//     // console.log(
//     //   `Sort: a [${a.package?.name} ${a.package?.onceDependencies?.join(
//     //     ","
//     //   )}] b [${b.package?.name}]  `
//     // );
//     if (
//       b.package?.name &&
//       a.package?.onceDependencies?.includes(b.package.name)
//     ) {
//       // console.log("a contains b as dependency. sort b before a");
//       return 1;
//     }

//     if (
//       a.package?.name &&
//       b.package?.onceDependencies?.includes(a.package.name)
//     ) {
//       // console.log("b contains a as dependency. sort a before b");
//       return -1;
//     }

//     if (a.package?.onceDependencies?.length) {
//       // console.log("a contains  dependencies. sort b before a");
//       return 1;
//     }

//     if (b.package?.onceDependencies?.length) {
//       // console.log("b contains  dependencies. sort a before b");
//       return -1;
//     }

//     // console.log("no dependency");
//     return 0;
//   }

//   static async initSubmodule(
//     name: string,
//     path: string,
//     url: string,
//     branch: string,
//     { baseDir, clone, init }: GitRepositoryParameter
//   ): Promise<DefaultSubmodule> {
//     //TODO maybe error basedir not
//     const gitRepository = simpleGit(join(baseDir, path), { binary: "git" });

//     if (!(await gitRepository.checkIsRepo()))
//       throw new NotAGitRepositoryError();

//     return new DefaultSubmodule(
//       name,
//       path,
//       url,
//       branch,
//       baseDir,
//       gitRepository
//     );
//   }

//   protected constructor(
//     name: string,
//     path: string,
//     url: string,
//     branch: string,
//     basePath: string,
//     gitRepo: SimpleGit,
//     distFolder: string = "dist"
//   ) {
//     const folderPath = join(basePath, path);
//     super(gitRepo, branch, url, folderPath);
//     this.name = name;
//     this.path = path;
//     this.url = url;
//     this.branch = branch;
//     this.basePath = basePath;
//     this.package = DefaultNpmPackage.getByFolder(folderPath);
//     this.distributionFolder = distFolder;

//     console.log(`SUBMODULE ${name} has branch ${branch}`)
//   }

//   async updateBranchToCheckoutVersion(): Promise<void> {
//     const checkoutBranch = DefaultGitRepository.getBranch(this.gitRepository)
//     console.log(this.name, await (await this.gitRepository.getConfig("remote.origin.url")).value, this.path, this.branch, checkoutBranch)

//     debugger;
//   }

//   private get rootDir() { return "./src" }
//   private get sourceDir() { return join(this.folderPath, this.rootDir) }


//   async initNewComponent(): Promise<void> {
//     const packageFile = join(this.path, "package.json");
//     if (!existsSync(packageFile)) throw new Error(`fail to find file ${packageFile}`)

//     let packageData = readFileSync(packageFile).toString();
//     let packageJson = JSON.parse(packageData);

//     if (packageJson.name) return;

//     console.log("init new component: " + this.name);

//     let gitUrl = await this.getSubmoduleValue("remote.origin.url");
//     let username = await this.getSubmoduleValue("user.name");

//     if (!this.path.match("EAMD.ucp")) throw new Error(`fail to init: Component is not in EAMD.ucp Directory`);
//     const componentPath = this.path.replace(/.+EAMD.ucp\//, '');

//     let packerSplit = componentPath.split('/');
//     const nameAndBranch = packerSplit.pop();
//     const componentName = packerSplit.pop();
//     const namespace = packerSplit.join(".");

//     packageJson.name = componentName;
//     packageJson.namespace = namespace;

//     packageJson.author = username;

//     packageJson.repository.url = 'git+' + gitUrl;
//     if (gitUrl.match("github")) {
//       packageJson.bugs.url = gitUrl + '/issues';
//       packageJson.homepage = gitUrl + '#readme'
//     }

//   }


//   async updateTsConfig(scenarioPath: string): Promise<void> {
//     const submoduleConfig = join(this.basePath, this.path, "tsconfig.json");
//     const submoduleBuildConfig = join(this.basePath, this.path, "tsconfig.build.json");
//     const mainConfig = join(this.basePath, "tsconfig.json");
//     const foo = readFileSync(submoduleConfig).toString();


//     console.log(submoduleConfig)
//     // console.log("FOOOOOOOO", join(this.baseDir, this.path));
//     // console.log("FOOOOOOOO", this.distributionFolder);
//     const tsconfig = JSON.parse(foo);

//     tsconfig.extends = relative(join(this.basePath, this.path), mainConfig);
//     if (!tsconfig.compilerOptions) tsconfig.compilerOptions = {}
//     tsconfig.compilerOptions.rootDir = this.rootDir
//     tsconfig.compilerOptions.outDir = relative(join(this.basePath, this.path), join(this.basePath, this.distributionFolder))

//     tsconfig.include = [
//       this.rootDir,
//       // relative(join(this.basePath, this.path), join(this.basePath, scenarioPath))
//     ]
//     tsconfig.exclude = [
//       "**/test/**/*",
//       "dist",
//       "node_modules",
//       // relative(join(this.basePath, this.path), this.distributionFolder)
//     ];

//     writeFileSync(submoduleBuildConfig, JSON.stringify(tsconfig, undefined, 2))
//     tsconfig.include.push(relative(join(this.basePath, this.path), join(this.basePath, scenarioPath)))
//     tsconfig.exclude.push(relative(join(this.basePath, this.path), this.distributionFolder))
//     writeFileSync(submoduleConfig, JSON.stringify(tsconfig, undefined, 2))
//   }

//   async installDependencies(): Promise<void> {
//     console.log(`npm i ${this.baseDir}`);
//     execSync("npm i", {
//       stdio: "inherit",
//       cwd: this.baseDir,
//     });
//   }

//   async build(watch: boolean = false): Promise<void> {

    //const ucpComponentDescriptor = UcpComponentDescriptor.getDescriptor(this.package.namespace, this.package.name, this.package.version) as ServerSideUcpComponentDescriptor

//     // TODO@Merge Add Export 
//     // ucpComponentDescriptor.createExportFile(this);

//     if (existsSync(join(this.baseDir, "tsconfig.json"))) {
//       return await this.buildTypescript(watch);
//     }
//     // if (this.name !== 'thinglish.transformer') {
//     //   if (ONCEClass === undefined) {
//     //     ONCEClass = (await import("../../../../dist/once.merge/main/1_infrastructure/OnceKernel.class.mjs")).default;
//     //     await ONCEClass.start();

//     //   }
//     //   let UcpComponentDescriptor = (await import("../../../../dist/once.merge/main/2_systems/ServerSideUcpComponentDescriptor.class.mjs")).default;
//     //   let compDesc = new UcpComponentDescriptor().init({ path: join(this.baseDir), relativePath: this.path });


//     //   compDesc.writeToDistPath();
//     // }


//   }

//   discoverFiles(): string[] {

//     //if (!this.folderPath) throw new Error("Missing path")
//     let dir = this.sourceDir;

//     let filesToReturn: string[] = [];
//     function walkDir(currentPath: string) {
//       let files = readdirSync(currentPath);
//       for (let i in files) {
//         let curFile = join(currentPath, files[i]);
//         if (statSync(curFile).isFile()) {
//           filesToReturn.push(curFile.replace(dir, ''));
//         } else if (statSync(curFile).isDirectory()) {
//           walkDir(curFile);
//         }
//       }
//     };
//     walkDir(dir);
//     return filesToReturn;

//   }

//   async linkNodeModules(): Promise<void> {
//     if (existsSync(this.node_modules)) {
//       const targetDir = this.distribution_node_modules;
//       try {
//         unlinkSync(targetDir);
//       } catch { }

//       let distributionFolder = join(this.basePath, this.distributionFolder)

//       if (!existsSync(distributionFolder)) {
//         mkdirSync(distributionFolder, { recursive: true });
//       }
//       console.log(`link node_modules from ${targetDir} to ${this.node_modules}`)
//       symlinkSync(this.node_modules, targetDir);


//       // existsSync(this.distribution_node_modules) && rmSync(this.distribution_node_modules, { recursive: true })
//       // cpSync(this.node_modules, this.distribution_node_modules, { recursive: true, preserveTimestamps: true, force: true });
//     }
//   }

//   watch(): Promise<void> {
//     return this.build(true)
//   }

//   private async buildTypescript(watch: boolean) {
//     execSync("npx tsc --project tsconfig.build.json", {
//       stdio: 'inherit',
//       cwd: this.baseDir,
//     });
//     console.log(`${this.name}@${this.branch} was builded using tsc`);


//     this.createDistSymlink();
//     // this.copyPackageJson();


//     if (watch) {
//       spawn("npx", ["tsc", "--project", "tsconfig.build.json", "--watch", "--preserveWatchOutput"], {
//         stdio: 'inherit',
//         cwd: join(this.baseDir),
//       });
//       console.log(`${this.name}@${this.branch} is watching for changes`);
//     }


//   }

//   private createDistSymlink() {

//     const targetDir = join(this.baseDir, "dist");

//     try {
//       rmSync(targetDir, { recursive: true })
//     } catch {
//     }

//     try {
//       unlinkSync(targetDir);
//     } catch {
//     }


//     symlinkSync(this.distribution_dist, targetDir)
//   }

//   private get baseDir(): string {
//     return join(this.basePath, this.path)
//   }

//   // private get packageJsonPath() {
//   //   return join(this.baseDir, "package.json");
//   // }

//   // private get distribution_packageJsonPath() {
//   //   return join(this.basePath, this.distributionFolder, "package.json");
//   // }

//   private get distribution_dist() {
//     return join(this.basePath, this.distributionFolder);
//   }

//   private get node_modules() {
//     return join(this.baseDir, "node_modules");
//   }


//   private get distribution_node_modules() {
//     return join(this.basePath, this.distributionFolder, "node_modules");
//   }


// }