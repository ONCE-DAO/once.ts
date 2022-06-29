import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { CustomPackageJson, CustomPackageJsonKeys } from "../../../3_services/Build/Npm/CustomPackageJson.type.mjs";
import NpmPackage, { NotAnNpmPackage as NotANpmPackage, NPM_PACKAGE_CONSTANTS } from "../../../3_services/Build/Npm/NpmPackage.interface.mjs";

export default class DefaultNpmPackage implements NpmPackage {
    path: string;

    private constructor(path: string) {
        this.path = path;
        if (!existsSync(this.packageJsonFilePath))
            throw new NotANpmPackage(path)
    }

    /**
     * Initialise a NpmPackage from folder path. 
     * @param path Path to a folder which contains a package.json file
     * @param fallbackName If package.json contains no definition for name it will replaced with this value
     * @param fallbackNamespace If package.json contains no definition for namespace it will replaced with this value
     * @param version If set, this will override the version of package.json
     * @returns initialised NpmPackage (interface)
     */
    static init(path: string, fallbackName: string, fallbackNamespace: string, version?: string): NpmPackage {
        const npmPackage = new this(path)
        npmPackage.setFallBackValue("name", fallbackName)
        npmPackage.setFallBackValue("namespace", fallbackNamespace)
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

    /**
     * returns the namespace value of package.json
     */
    get namespace(): string {
        return this.getPackageJsonValue("namespace")
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