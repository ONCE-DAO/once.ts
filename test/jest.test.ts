import path, { join } from "path";
// import { myResult as staticImportSuccess } from "./MyResolveResult.mjs";
test("process environment is set to test by jest", () => {
    expect(process.env.NODE_ENV).toBe('test');
})

test("TS code getting compiled", () => {
    interface MyInterFace {
        get stuff(): MyEnum;
    }

    enum MyEnum {
        Apple = "APPLE",
        Orange = "ORANGE",
        Banana = "BANANA"
    }

    class MyClass implements MyInterFace {
        public stuff: MyEnum;
        public constructor(stuff: MyEnum) {
            this.stuff = stuff;
        }
    }

    expect(new MyClass(MyEnum.Apple).stuff).toBe(MyEnum.Apple);
    expect(new MyClass(MyEnum.Orange).stuff).toBe(MyEnum.Orange);
    expect(new MyClass(MyEnum.Banana).stuff).toBe(MyEnum.Banana);
})

// test("can import esm modules", async () => {
//     expect(staticImportSuccess).toBe(42)
// })

test("Once is running in Test Mode", () => {
    // @ts-ignore cannot redeclare once here without getting in trouble with global definition of Once
    const once = global.ONCE
    expect(once).not.toBeUndefined()
    expect(once).not.toBeNull()
    expect(once.mode).toBe("TEST_ENVIRONMENT")
});

// test("Test Resolver is added and working", async () => {
//     //@ts-ignore
//     const { myResult } = (await import("./TEST_RESOLVE.mjs"))
//     expect(myResult).toBe(42)
// });

test("Test Resolver can load over IOR string", async () => {
    const imported = (await import("ior:esm:/tla.EAM.Once[build]"))
    expect(imported).not.toBeUndefined()
    expect(imported).not.toBeNull()
});


test("Test Resolver can async import module", async () => {
    const imported = (await import("../../../../../../Scenarios/localhost/tla/EAM/Once/Server/build/index.export.mjs"))
    expect(imported).not.toBeUndefined()
    expect(imported).not.toBeNull()
});

test("Test Resolver can async import module absolute path", async () => {
    ONCE.eamd.currentScenario.scenarioPath
    const imported = (await import(path.join(ONCE.eamd.currentScenario.scenarioPath, "/tla/EAM/Once/Server/build/index.export.mjs")))
    expect(imported).not.toBeUndefined()
    expect(imported).not.toBeNull()
});

test("When .mts files from Components folder are loaded, the .mjs from Scenario will be returned", async () => {
    const Test = new (await import("../../../../../tla/EAM/Once/once@build/src/Test.class.mjs")).default()
    const expected = `file://${join(global.ONCE.eamd.currentScenario.scenarioPath, "tla", "EAM", "Once", "build", "Test.class.mjs")}`
    expect(Test.importPath).toBe(expected)
});
