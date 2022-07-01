import DefaultEAMD from "../2_systems/UCP/EAMD.class.mjs";
import { EAMD_CONSTANTS } from "../3_services/UCP/EAMD.interface.mjs";

const scenarioDomain = process.env.SCENARIO_DOMAIN || EAMD_CONSTANTS.DEFAULT_SCENARIO_DOMAIN
const basePath = process.env.BASE_PATH || process.cwd()

const eamd = await DefaultEAMD.init(basePath)
console.log(eamd.currentScenario);
console.log(await eamd.scenarios);