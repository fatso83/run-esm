import myModule from "./example-module.mjs";

if (typeof myModule !== "function") {
  throw new TypeError(
    "It seems the example module was not able to be imported correctly :("
  );
}
