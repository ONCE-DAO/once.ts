import { relative } from "path";
import DefaultFolder from "../2_systems/File/Folder.class.mjs";
import DefaultEAMD from "../2_systems/UCP/EAMD.class.mjs";
import { EAMD_CONSTANTS } from "../3_services/UCP/EAMD.interface.mjs";

const scenarioDomain = process.env.SCENARIO_DOMAIN || EAMD_CONSTANTS.DEFAULT_SCENARIO_DOMAIN
const basePath = process.env.BASE_PATH || process.cwd()





const eamd = await DefaultEAMD.init(basePath)
console.log(eamd.currentScenario);
console.log(await Promise.all(
    (await eamd.scenarios)
        .map(async scenario => ({
            ...scenario,
            scenarioPath: relative(basePath, scenario.scenarioPath),
            components: (await scenario.components)
        }))));
