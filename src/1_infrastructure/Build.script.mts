import Scenario from "../2_systems/Scenario.class.mjs";
import EAMD from "./EAMD.class.mjs";

const eamd = await EAMD.getInstance(Scenario.Default)
const watch = process.env.WATCH == "true";

await eamd.build(watch);
