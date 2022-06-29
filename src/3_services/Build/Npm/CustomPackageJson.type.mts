import { CoreProperties } from "./PackageJson.type.mjs";

type custom = {
    // namespace?: string;
    onceDependencies?: string[];
}
export type CustomPackageJson = CoreProperties & custom
export type CustomPackageJsonKeys = keyof CustomPackageJson
