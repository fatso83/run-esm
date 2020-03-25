const FAILURE = "bundle-check-FAIL";
const OK = "bundle-check-OK";

function signalBundleOK() {
  console.log(OK);
}

function signalFailure(...args) {
  console.log(FAILURE, args.map(String).join());
}

// make it possible to reference this in Node without crashing browsers
if (typeof module !== "undefined") {
  module.exports = {
    FAILURE,
    OK,
  };
}
