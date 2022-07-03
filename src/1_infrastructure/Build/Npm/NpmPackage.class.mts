import { execSync } from "child_process";
import { existsSync, mkdir, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "fs";
import { join } from "path";
import Buildable from "../../../3_services/Build/Buildable.interface.mjs";
import BuildConfig from "../../../3_services/Build/BuildConfig.interface.mjs";
import { CustomPackageJson, CustomPackageJsonKeys } from "../../../3_services/Build/Npm/CustomPackageJson.type.mjs";
import NpmPackage, { NotAnNpmPackage as NotANpmPackage, NPM_PACKAGE_CONSTANTS } from "../../../3_services/Build/Npm/NpmPackage.interface.mjs";

export default class DefaultNpmPackage implements NpmPackage, Buildable {
    path: string;

    private constructor(path: string) {
        this.path = path;
        if (!existsSync(this.packageJsonFilePath))
            throw new NotANpmPackage(path)

    }
    async install(_config: BuildConfig, _distributionFolder: string): Promise<void> {
        console.group(`DefaultNpmPackage install [${import.meta.url}]"`);

        execSync("npm i", { cwd: this.path, stdio: "inherit" });
        console.log("npm dependencies installed");

        console.groupEnd();
        console.log("DefaultNpmPackage install done");
    }

    async beforeBuild(_config: BuildConfig, _distributionFolder: string): Promise<void> {
    }

    async build(_config: BuildConfig, distributionFolder: string): Promise<void> {
        console.group(`DefaultNpmPackage build [${import.meta.url}]"`);
        this.symlinkNodeModules(this.path, distributionFolder)
        console.groupEnd();
        console.log("DefaultNpmPackage build done");
    }

    async watch(_config: BuildConfig, _distributionFolder: string): Promise<void> {
    }

    private symlinkNodeModules(from: string, to: string) {
        mkdirSync(to, { recursive: true })
        from = join(from, NPM_PACKAGE_CONSTANTS.NODE_MODULES)
        to = join(to, NPM_PACKAGE_CONSTANTS.NODE_MODULES)
        if (!existsSync(from)) {
            console.log("node_modules folder does not exist, skipping symlink creation");
            return;
        }

        if (existsSync(to)) rmSync(to, { recursive: true })
        symlinkSync(from, to)
        console.log(`symlink created for node_module in ${to}`);
    }

    /**
     * Initialise a NpmPackage from folder path. 
     * @param path Path to a folder which contains a package.json file
     * @param fallbackName If package.json contains no definition for name it will replaced with this value
     * @param _fallbackNamespace If package.json contains no definition for namespace it will replaced with this value
     * @param version If set, this will override the version of package.json
     * @returns initialised NpmPackage (interface)
     */
    static init(path: string, fallbackName: string, _fallbackNamespace: string, version?: string): NpmPackage {
        const npmPackage = new this(path)
        npmPackage.setFallBackValue("name", fallbackName)
        version && npmPackage.setValue("version", version)

        return npmPackage;
    }

    /**
     * Returns the parsed package.json file
     */
    get packageJson(): CustomPackageJson {
        return JSON.parse(readFileSync(this.packageJsonFilePath).toString())
    }

    /**
     * Overwrites the package.json file with value
     */
    set packageJson(value: CustomPackageJson) {
        writeFileSync(this.packageJsonFilePath, JSON.stringify(value, undefined, 2))
    }

    /**
     * returns the name value of package.json
     */
    get name(): string {
        return this.getPackageJsonValue("name")
    }

    private setValue<KEY extends CustomPackageJsonKeys>(property: KEY, value: CustomPackageJson[KEY]) {
        const packageJson = this.packageJson
        packageJson[property] = value;
        this.packageJson = packageJson
    }

    private setFallBackValue<KEY extends CustomPackageJsonKeys>(property: KEY, fallbackValue: CustomPackageJson[KEY]) {
        try {
            this.getPackageJsonValue(property);
        }
        catch {
            const packageJson = this.packageJson
            packageJson[property] = fallbackValue;
            this.packageJson = packageJson
        }
    }

    private getPackageJsonValue<KEY extends CustomPackageJsonKeys>(property: KEY): NonNullable<CustomPackageJson[KEY]> {
        const propertyValue = Object(this.packageJson)[property]
        if (propertyValue == null)
            throw new Error(`Property: ${property} is not defined in ${this.packageJsonFilePath}`)
        return propertyValue
    }

    private get packageJsonFilePath() {
        return join(this.path, NPM_PACKAGE_CONSTANTS.PACKAGE_JSON_FILE)
    }
}