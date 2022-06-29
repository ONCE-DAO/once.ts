import { join } from "path";
import GitRepository from "./GitRepository.interface.mjs";

export default interface GitSubmodule extends GitRepository {
  // name: string;
}

export const GIT_SUBMODULE_CONSTANTS = {
  POST_CHECKOUT_PATH: join("hooks", "post-checkout")
}