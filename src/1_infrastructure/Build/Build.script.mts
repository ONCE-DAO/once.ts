import DefaultNodeOnceImportLoader from "../../2_systems/Once/DefaultNodeOnceImportLoader.mjs"
import { EAMD_CONSTANTS } from "../../3_services/UCP/EAMD.interface.mjs"
import OnceKernel from "../OnceKernel.class.mjs"
import DefaultEAMRepository from "./EAMRepository.class.mjs"

const scenarioDomain = process.env.SCENARIO_DOMAIN || EAMD_CONSTANTS.DEFAULT_SCENARIO_DOMAIN
const basePath = process.env.BASE_PATH || process.cwd()
let watch = process.env.WATCH === "true"



console.log("Call Arguments:" + process.argv.join(" "))
let fast = false;
let ignoreErrors = false;
let paths: string[] = [];

let cmdArguments = process.argv.splice(2);
if (cmdArguments.filter(x => x === "fast").length) fast = true;
if (cmdArguments.filter(x => x === "watch").length) watch = true;
if (cmdArguments.filter(x => x === "ignoreErrors").length) ignoreErrors = true;

let pathObject = cmdArguments.filter(x => x.match(/^buildPath=/))
if (pathObject.length) {
    let matchPath = pathObject[0].match(/^buildPath=(.+)/)
    if (matchPath && matchPath[1]) paths = matchPath[1].split(',');
}

const once = await DefaultNodeOnceImportLoader.start();
await once.start();

const eamr = await DefaultEAMRepository.init(scenarioDomain, basePath, fast)

if (ignoreErrors) eamr.ignoreErrors = true;

if (paths.length) {
    for (const path of paths) {
        await eamr.build(fast, path)
    }
} else {
    await eamr.beforeBuild()

    watch ?
        await eamr.watch(fast)
        : await eamr.build(fast)
}
