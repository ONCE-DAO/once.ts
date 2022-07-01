// import { mkdtempSync, mkdirSync, rmSync, existsSync } from 'fs';
// import { tmpdir } from "os"
// import { join } from 'path';
// import { DefaultScenario } from '../../../src/2_systems/UCP/DefaultScenario.mjs';
// import { EAMD_CONSTANTS } from '../../../src/3_services/UCP/EAMD.interface.mjs';

// const ScenarioDomains = [
//     "localhost",
//     "de.woda.prod",
//     "de.woda.dev",
//     "de.woda.test",
//     ".localhost",
//     ".de.woda.prod",
//     ".de.woda.dev",
//     ".de.woda.test",
// ]

// let tempEamdPath = ""

// beforeAll(() => {
//     tempEamdPath = mkdtempSync(join(tmpdir(), "EAMD.ucp-"))
//     mkdirSync(tempEamdPath, { recursive: true })
// })

// afterAll(() => {
//     rmSync(tempEamdPath, { recursive: true, force: true })
// })



// ScenarioDomains.forEach(domain =>
//     describe(`When creating Scenario with domain ${domain}`, () => {
//         const folderStructure = join(EAMD_CONSTANTS.SCENARIOS, ...domain.split(".").filter(x => x))

//         test(`Folder structure [${folderStructure}] have to be created under Scenario folder`, async () => {
//             const expectedFolder = join(tempEamdPath, folderStructure)
//             const expectedWebRoot = join(expectedFolder, EAMD_CONSTANTS.WEB_ROOT)
//             const scenario = await DefaultScenario.init(domain, tempEamdPath);

//             expect(expectedFolder).toBe(scenario.scenarioPath)
//             expect(expectedWebRoot).toBe(scenario.webRoot)
//             expect(existsSync(expectedFolder)).toBeTruthy()
//         })
//     }))

