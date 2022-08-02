import DefaultIOR from "../../../src/2_systems/NewThings/DefaultIOR.class.mjs";
import ClassDescriptor from "../../../src/2_systems/Things/ClassDescriptor.class.mjs";

describe("IOR Class", () => {


    test("clone", async () => {
        let desc = DefaultIOR.classDescriptor
        expect(desc).toBeInstanceOf(ClassDescriptor);

    })
});