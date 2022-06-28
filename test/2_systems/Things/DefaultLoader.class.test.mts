import ServerSideEAMDLoader from "../../../src/2_systems/EAMD/ServerSideEAMDLoader.class.mjs";
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class.mjs";
import DefaultLoader from "../../../src/2_systems/Things/DefaultLoader.class.mjs"


describe("Default Loader", () => {
    test("Find Loader", async () => {
        let loader = DefaultLoader.findLoader(new DefaultIOR().init("ior:esm:git:tla.EAM.Once"));
        expect(loader).toBeInstanceOf(ServerSideEAMDLoader);
    })
})