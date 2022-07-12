import EAMRepositoryInterface from "../../3_services/Build/EAMRepository.interface.mjs";
import { OnceMode, OnceNodeImportLoader, OnceState, JestOnce as JestOnceInterface } from "../../3_services/Once.interface.mjs";
import EAMD, { EAMD_CONSTANTS } from "../../3_services/UCP/EAMD.interface.mjs";
import DefaultEAMD from "../UCP/EAMD.class.mjs";
import { AbstractNodeOnce } from "./AbstractNodeOnce.mjs";
import OldEAMD from "../../1_infrastructure/EAMD.class.mjs";
import OldEAMDInterface from "../../3_services/EAMD.interface.mjs";
import DefaultScenario from "../Things/Scenario.class.mjs";
import DefaultEAMRepository from "../../1_infrastructure/Build/EAMRepository.class.mjs";
import DefaultNodeOnceImportLoader from "./DefaultNodeOnceImportLoader.mjs";


export default class JestOnce extends DefaultNodeOnceImportLoader implements OnceNodeImportLoader, JestOnceInterface {
  srcEamd: EAMRepositoryInterface;
  global = global;
  ENV = process.env;
  creationDate = new Date();
  mode = OnceMode.TEST_ENVIRONMENT;
  state = OnceState.STARTED;

  static async start(): Promise<AbstractNodeOnce> {
    const scenarioDomain = process.env.SCENARIO_DOMAIN || EAMD_CONSTANTS.DEFAULT_SCENARIO_DOMAIN
    const basePath = process.env.BASE_PATH || process.cwd()
    const eamd = await DefaultEAMD.init(basePath, scenarioDomain);
    const oldEamd = await OldEAMD.getInstance(DefaultScenario.Default)
    const srcEamd = await DefaultEAMRepository.init(scenarioDomain, basePath)
    return new this(eamd, oldEamd, srcEamd);
  }

  constructor(eamd: EAMD, oldEAMD: OldEAMDInterface, srcEamd: EAMRepositoryInterface) {
    super(eamd, oldEAMD);
    this.srcEamd = srcEamd;
  }
}
