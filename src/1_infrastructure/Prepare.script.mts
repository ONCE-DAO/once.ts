import { existsSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import Scenario from "../2_systems/Scenario.class.mjs";
import EAMD from "./EAMD.class.mjs";
import Submodule from "../3_services/Submodule.interface.mjs";
import GitRepository from "../3_services/GitRepository.interface.mjs";

execSync("npx ts-patch install", {
  stdio: "inherit",
});

const eamd = await EAMD.getInstance(Scenario.Default)

await eamd.runForSubmodules(async (sub: Submodule & GitRepository) => {
  if (sub.package?.devDependencies && sub.package.devDependencies["ts-patch"]) {
    console.log("npx ts-patch install @", sub.folderPath);
    execSync("npx ts-patch install", {
      stdio: "inherit",
      cwd: sub.folderPath,
    });
  }

  await sub.checkout(sub.branch);
  // await sub.installDependencies();
});

!existsSync("Scenarios") && mkdirSync("Scenarios");
