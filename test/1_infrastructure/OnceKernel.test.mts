import OnceKernel from "../../../../dist/once.ts/main/1_infrastructure/OnceKernel.class.mjs";

test("adds 1 + 2 to equal 3", () => {
  expect(1 + 2).toBe(3);
});

test("import test", () => {
  expect(OnceKernel.test()).toBe("test");
});
