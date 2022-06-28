import ServerSideEAMDLoader from "../../../src/2_systems/EAMD/ServerSideEAMDLoader.class.mjs";
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class.mjs";
import { DefaultIOR as ScenarioDefaultIOR } from "../../../../../../../../Scenarios/localhost/webroot/tla/EAM/Once/dev/index.mjs"
import { DefaultIOR as IorImportDefaultIOR } from "ior:esm:/tla.EAM.Once[dev]"

// beforeEach(async () => {
//   if (ONCE_STARTED === false) await OnceNodeServer.start();
// });

describe("EAMD Loader", () => {
  test(`IOR Find Loader`, async () => {
    // @ts-ignore
    let ior = new DefaultIOR().init("ior:esm:/tla.EAM.Once[dev]");
    expect(ior.loader).toBe(undefined);
    let loader = await ior.discoverLoader();
    expect(loader).toBeInstanceOf(ServerSideEAMDLoader);
  });

  test(`IOR load Thing from Namespace`, async () => {
    let loadedDefaultIOR = (await DefaultIOR.load("ior:esm:/tla.EAM.Once[dev]"))
      .DefaultIOR;
    expect(loadedDefaultIOR.classDescriptor.name).toEqual(
      DefaultIOR.classDescriptor.name
    );
    // TODO
    expect(loadedDefaultIOR).not.toEqual(
      DefaultIOR
    );
    expect(loadedDefaultIOR).toEqual(
      ScenarioDefaultIOR
    );
    expect(loadedDefaultIOR).toEqual(
      IorImportDefaultIOR
    );
  });

  test("NODE_ENV", () => {
    expect(process.env.NODE_ENV).toBe("test");
  });

  test(`CanHandler`, async () => {
    let ior = new DefaultIOR().init("ior:esm:/tla.EAM.Once[dev]");

    expect(ServerSideEAMDLoader.canHandle(ior)).toBe(1);

    //@ts-ignore
    expect((await ior.discoverLoader()).canHandle(ior)).toBe(1);

    let ior2 = new DefaultIOR().init("ior:google.de");

    expect(ServerSideEAMDLoader.canHandle(ior2)).toBe(0);
  });
  // TODO@PB Transform .js into .mjs

  // test(`load once.cli`, async () => {
  //   // if (!global.ONCE) await OnceNodeServer.start();
  //   let loadedONCE = await DefaultIOR.load(ior:esm:/tla.EAM.Once[dev]");
  //   expect(typeof loadedONCE).toBe("string");
  // }, 100000000);

  // test(`import load Thing from Namespace`, async () => {

  //   // @ts-ignore
  //   let loadedDefaultIOR = (await import("ior:esm:git:tla.EAM.Once")).DefaultIOR;
  //   expect(loadedDefaultIOR).toEqual(DefaultIOR);
  // })
});
