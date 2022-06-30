import { EAMD_CONSTANTS } from "../3_services/UCP/EAMD.interface.mjs";
import DefaultEAMRepository from "./Build/EAMRepository.class.mjs";

const scenarioDomain = process.env.SCENARIO_DOMAIN || EAMD_CONSTANTS.DEFAULT_SCENARIO_DOMAIN
const basePath = process.env.BASE_PATH || process.cwd()

const eamr = await DefaultEAMRepository.init(scenarioDomain, basePath)

await eamr.beforeBuild()
await eamr.build();
await eamr.afterBuild();