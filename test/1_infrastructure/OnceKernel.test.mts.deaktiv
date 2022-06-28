
import fs from "fs";
import path from "path";
import ExtendedPromise from "./Promise.class.mjs";

const getAllFiles = function (dirPath: string, arrayOfFiles: string[] = []) {
let files = fs.readdirSync(dirPath)


files.forEach(function (file: string) {
  if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
  } else {
      arrayOfFiles.push(path.join(dirPath, "/", file))
  }
})

return arrayOfFiles
}

let basePath = "Components/tla/EAM/Once/once@dev/src/"
let files = getAllFiles(basePath).filter(f => f.endsWith(".mts"));

for (const file of files) {
const filePath = "../../src/" + file.replace(basePath, "");

test("Check loading File: " + file.replace(basePath, ""), async () => {

  let result = false;
  let promiseHandler = ExtendedPromise.createPromiseHandler(100);

  let loadPromise = import(filePath);
  loadPromise.then(x => { result = true; promiseHandler.setSuccess("ok") })
  await promiseHandler.promise;
  expect(result).toBeTruthy();
});
}