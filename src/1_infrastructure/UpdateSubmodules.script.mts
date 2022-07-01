import Scenario from "../2_systems/Scenario.class.mjs";
import EAMD from "./EAMD.class.mjs";

const eamd = await EAMD.getInstance(Scenario.Default)

eamd.runForSubmodules(async(submodule)=>{
    // submodule.updateBranchToCheckoutVersion()
})