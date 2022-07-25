import { EAMD_CONSTANTS } from "../../3_services/UCP/EAMD.interface.mjs"
import DefaultEAMRepository from "./EAMRepository.class.mjs"

const scenarioDomain = process.env.SCENARIO_DOMAIN || EAMD_CONSTANTS.DEFAULT_SCENARIO_DOMAIN
const basePath = process.env.BASE_PATH || process.cwd()
let watch = process.env.WATCH === "true"

console.log("Call Arguments:" + process.argv.join(" "))
let fast = false;
if (typeof process.argv[2] === "string" && process.argv[2].match("fast")) fast = true;
if (typeof process.argv[2] === "string" && process.argv[2].match("watch")) watch = true;

const eamr = await DefaultEAMRepository.init(scenarioDomain, basePath, fast)


await eamr.beforeBuild()
watch ?
    await eamr.watch(fast)
    : await eamr.build(fast)
