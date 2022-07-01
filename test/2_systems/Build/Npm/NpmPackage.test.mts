// import { mkdtempSync, rmSync, writeFileSync } from "fs"
// import { tmpdir } from "os"
// import { join } from "path"
// import DefaultNpmPackage from "../../../../src/2_systems/Build/Npm/NpmPackage.class.mjs"
// import { CustomPackageJson } from "../../../../src/3_services/Build/Npm/CustomPackageJson.type.mjs"
// import { NotAnNpmPackage, NPM_PACKAGE_CONSTANTS } from "../../../../src/3_services/Build/Npm/NpmPackage.interface.mjs"


// function createPackage(packageJson: CustomPackageJson): string {
//     const directory = mkdtempSync(join(tmpdir(), "npmPackage-"))
//     writeFileSync(join(directory, NPM_PACKAGE_CONSTANTS.PACKAGE_JSON_FILE), JSON.stringify(packageJson))
//     return directory;
// }

// describe("When directory has no package.json", () => {
//     test("init function will throw a error", () => {
//         const emptyDirectory = mkdtempSync(join(tmpdir(), "empty-"))
//         try {
//             const fn = () => DefaultNpmPackage.init(emptyDirectory, "", "")
//             expect(fn).toThrow(NotAnNpmPackage)
//         }
//         finally {
//             rmSync(emptyDirectory, { recursive: true })
//         }
//     })
// })

// describe("When directory contains package.json", () => {
//     test("name, namespace have to be parsed correctly", () => {
//         const json = { name: "myPackage", namespace: "myNamespace" }
//         const path = createPackage(json)

//         try {
//             const npmPackage = DefaultNpmPackage.init(path, "", "")
//             expect(npmPackage.name).toBe(json.name)
//             expect(npmPackage.namespace).toBe(json.namespace)
//         }
//         finally {
//             rmSync(path, { recursive: true })
//         }
//     })

//     test("name,namespace fallback values should not apply if already set", () => {
//         const json = { name: "myPackage", namespace: "myNamespace" }
//         const path = createPackage(json)

//         try {
//             const npmPackage = DefaultNpmPackage.init(path, "fallbackName", "fallback.namespace")
//             expect(npmPackage.name).toBe(json.name)
//             expect(npmPackage.namespace).toBe(json.namespace)
//         }
//         finally {
//             rmSync(path, { recursive: true })
//         }
//     })

//     test("name fallback value should apply if not set", () => {
//         const json = { namespace: "myNamespace" }
//         const path = createPackage(json)

//         try {
//             const npmPackage = DefaultNpmPackage.init(path, "fallbackName", "fallback.namespace")
//             expect(npmPackage.name).toBe("fallbackName")
//             expect(npmPackage.namespace).toBe(json.namespace)
//         }
//         finally {
//             rmSync(path, { recursive: true })
//         }
//     })

//     test("namespace fallback value should apply if not set", () => {
//         const json = { name: "myName" }
//         const path = createPackage(json)

//         try {
//             const npmPackage = DefaultNpmPackage.init(path, "fallbackName", "fallback.namespace")
//             expect(npmPackage.name).toBe(json.name)
//             expect(npmPackage.namespace).toBe("fallback.namespace")
//         }
//         finally {
//             rmSync(path, { recursive: true })
//         }
//     })
// })