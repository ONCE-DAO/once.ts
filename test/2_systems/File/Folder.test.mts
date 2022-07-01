// import { mkdtempSync, existsSync, rmSync, appendFileSync, mkdirSync } from 'fs';
// import { tmpdir } from "os";
// import { join } from "path";
// import NodeFolder from "../../../src/2_systems/File/NodeFolder.class.mjs"

// declare global {
//     interface String {
//         makeFiles(count?: number, extension?: string): String
//         makeSubDir(): String
//     }
// }

// String.prototype.makeFiles = function (count: number = 1, extension: string = "txt"): String {
//     for (let i = 0; i < count; i++)appendFileSync(join(this.toString(), `file-${i}.${extension}`), "")
//     return this;
// }

// String.prototype.makeSubDir = function (): String {
//     return mkdtempSync(join(this.toString(), "sub-"))
// }

// let testDir: string = "";
// beforeAll(() => {
//     testDir = mkdtempSync(join(tmpdir(), "folder-"))
//     console.log(testDir)

//     testDir
//         .makeFiles(10)
//         .makeFiles(10, "ts")
//         .makeFiles(5, "js")
//         .makeSubDir()
//         .makeFiles(10)
//         .makeFiles(10, "ts")
//         .makeFiles(5, "js")
//         .makeSubDir()
//         .makeFiles(10)
//         .makeFiles(10, "ts")
//         .makeFiles(5, "js")
// })


// afterAll(() => {
//     existsSync(testDir.toString()) && rmSync(testDir.toString(), { recursive: true });
// })


// describe("When searching for files in folder", () => {
//     test("folder should return all files", () => {
//         let folder = new NodeFolder(testDir.toString());
//         expect(folder.exists).toBeTruthy()
//         expect(folder.getFiles().length).toBe(25)
//     })
//     test("folder should return all filtered files", () => {
//         let folder = new NodeFolder(testDir.toString());
//         expect(folder.exists).toBeTruthy()
//         expect(folder.getFiles([".js"]).length).toBe(5)
//     })
//     test("folder should return all multi filtered files", () => {
//         let folder = new NodeFolder(testDir.toString());
//         expect(folder.exists).toBeTruthy()
//         expect(folder.getFiles([".js", ".ts"]).length).toBe(15)
//     })
// })

// describe("When searching recursive for files in folder", () => {
//     test("folder should return all files", () => {
//         let folder = new NodeFolder(testDir.toString());
//         expect(folder.exists).toBeTruthy()
//         expect(folder.getFiles(undefined,true).length).toBe(75)
//     })
//     test("folder should return all filtered files", () => {
//         let folder = new NodeFolder(testDir.toString());
//         expect(folder.exists).toBeTruthy()
//         expect(folder.getFiles([".js"],true).length).toBe(15)
//     })
//     test("folder should return all multi filtered files", () => {
//         let folder = new NodeFolder(testDir.toString());
//         expect(folder.exists).toBeTruthy()
//         expect(folder.getFiles([".js", ".ts"],true).length).toBe(45)
//     })
// })


