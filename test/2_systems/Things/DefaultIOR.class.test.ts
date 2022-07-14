import DefaultIOR from "../../../src/2_systems/NewThings/DefaultIOR.class.mjs";
import IOR from "../../../src/3_services/IOR.interface.mjs";
import { urlProtocol } from "../../../src/3_services/Url.interface.mjs";

describe("IOR Class", () => {


  test("clone", async () => {
    let url = new DefaultIOR().init("https://google.de/some/test?asdf=123");
    let url2 = url.clone();
    expect(url2.href).toEqual(url.href);
    expect(url2).not.toBe(url);

  })



  let validate: { url: string, result: Partial<IOR> }[] = [];

  validate.push({
    url: "https://shifter.staging.shiftphones.com:30484/",
    result: {
      protocol: [urlProtocol.ior, urlProtocol.https],
      pathName: "/",
      fileName: undefined,
      fileType: undefined,
      search: "",
      searchParameters: {},
      hash: undefined,
      host: "shifter.staging.shiftphones.com:30484",
      port: 30484,
      normalizedHref: "https://shifter.staging.shiftphones.com:30484/",
      origin: "https://shifter.staging.shiftphones.com:30484",
      hostName: "shifter.staging.shiftphones.com",
      href: "ior:https://shifter.staging.shiftphones.com:30484/",
    },
  });

  validate.push({
    url: "ior:ude:rest:http://test.wo-da.de/ior/131cac9f-ceb3-401f-a866-73f7a691fed7",
    result: {
      protocol: [urlProtocol.ior, urlProtocol.ude, urlProtocol.rest, urlProtocol.http],
      hostName: "test.wo-da.de",
      pathName: "/ior/131cac9f-ceb3-401f-a866-73f7a691fed7",
      origin: "http://test.wo-da.de",
      id: "131cac9f-ceb3-401f-a866-73f7a691fed7",
    },
  });

  validate.push({
    url: "ior:esm:git:tla.EAM.Once",
    result: {
      protocol: [urlProtocol.ior, urlProtocol.esm, urlProtocol.git],
      hostName: undefined,
      pathName: undefined,
      origin: undefined,
      package: "tla.EAM.Once",
    },
  });

  validate.push({
    url: "ior:esm:git:tla.EAM.Once[1.0.0]",
    result: {
      protocol: [urlProtocol.ior, urlProtocol.esm, urlProtocol.git],
      hostName: undefined,
      pathName: undefined,
      origin: undefined,
      package: "tla.EAM.Once",
      version: "1.0.0",
    },
  });

  validate.push({
    url: "ior:esm:git:tla.EAM.Once[^1.0.0]",
    result: {
      protocol: [urlProtocol.ior, urlProtocol.esm, urlProtocol.git],
      hostName: undefined,
      pathName: undefined,
      origin: undefined,
      package: "tla.EAM.Once",
      version: "^1.0.0",
      href: "ior:esm:git:/tla.EAM.Once[^1.0.0]"
    },
  });

  validate.push({
    url: "ior:esm:git:tla.EAM.Once[latest]",
    result: {
      protocol: [urlProtocol.ior, urlProtocol.esm, urlProtocol.git],
      hostName: undefined,
      pathName: undefined,
      origin: undefined,
      package: "tla.EAM.Once",
      version: "latest",
      href: "ior:esm:git:/tla.EAM.Once[latest]"
    },
  });



  validate.push({
    url: "ior:esm:git:tla.EAM.package[#branchName]",
    result: {
      protocol: [urlProtocol.ior, urlProtocol.esm, urlProtocol.git],
      hostName: undefined,
      pathName: undefined,
      origin: undefined,
      package: "tla.EAM.package",
      version: "#branchName",
      href: "ior:esm:git:/tla.EAM.package[#branchName]"
    },
  });

  validate.push({
    url: "ior:esm:git:tla.EAM.Once[latest]/someClassName",
    result: {
      protocol: [urlProtocol.ior, urlProtocol.esm, urlProtocol.git],
      hostName: undefined,
      pathName: undefined,
      origin: undefined,
      package: "tla.EAM.Once",
      version: "latest",
      namespaceObject: "someClassName",
      href: "ior:esm:git:/tla.EAM.Once[latest]/someClassName"
    },
  });

  validate.push({
    url: "ior:esm:git:/tla.EAM.Once[latest]",
    result: {
      protocol: [urlProtocol.ior, urlProtocol.esm, urlProtocol.git],
      hostName: undefined,
      pathName: undefined,
      origin: undefined,
      package: "tla.EAM.Once",
      version: "latest",
      href: "ior:esm:git:/tla.EAM.Once[latest]"
    },
  });

  validate.push({
    url: "ior:ude:http://localhost:3000/UDE/6b8c04b7-c88f-4cde-ba97-325e6914d2bd",
    result: {
      protocol: [urlProtocol.ior, urlProtocol.ude, urlProtocol.http],
      port: 3000,
      hostName: "localhost",
      pathName: "/UDE/6b8c04b7-c88f-4cde-ba97-325e6914d2bd",
      origin: "http://localhost:3000",
      id: "6b8c04b7-c88f-4cde-ba97-325e6914d2bd",
      href: "ior:ude:http://localhost:3000/UDE/6b8c04b7-c88f-4cde-ba97-325e6914d2bd"
    },
  });


  // validate.push({
  //   url: "ior:esm:github:tla.EAM.OnceService.Once.express#/ONCE-DAO/Once.express",
  //   result: {
  //     protocol: [urlProtocol.ior, urlProtocol.esm, "github"],
  //     hostName: undefined,
  //     pathName: undefined,
  //     origin: undefined,
  // 
  //     package: "tla.EAM.OnceService.Once.express",
  //     version: "#sdsgzudhsudhusidh",
  //     href: "ior:github:tla.EAM.OnceService.Once.express#/ONCE-DAO/Once.express"
  //   },
  // });




  for (let testConfig of validate) {
    test("Test Parser IOR: " + testConfig.url, () => {
      let url = new DefaultIOR().init(testConfig.url);
      for (const [keyString, value] of Object.entries(testConfig.result)) {
        const key = keyString as keyof IOR;
        expect(url[key], `${key} : ${value} => ${url[key]}`).toEqual(value);
      }
    });

  }
});
