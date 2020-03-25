/* eslint-disable no-process-exit */
const puppeteer = require("puppeteer");

const debug = require("debug")("run-esm");
const assert = require("assert");
const http = require("http");
const fs = require("fs");
const getPort = require("get-port");
const { OK, FAILURE } = require("./helpers.js");
const { basename } = require("path");
const helpersSource = fs.readFileSync(`${__dirname}/helpers.js`);
const TIMEOUT = 1500;

const htmlWithModuleScript = (testScriptSource) => `
<script src="/helpers.js"></script>

<script>
window.onerror = signalFailure
</script>

<script type="module">
/** This test script needs to signal failure  */
${testScriptSource}
signalBundleOK();
</script>
`;

const evaluatePageContent = ({
  resolve,
  reject,
  port,
  puppeteerArgs,
  puppeteerExecutablePath,
}) =>
  async function () {
    assert(port);

    const timerRef = setTimeout(
      () => die("No result within timeout."),
      TIMEOUT
    );
    const browser = await puppeteer.launch({
      args: puppeteerArgs,
      // allow overriding chrome path
      executablePath: puppeteerExecutablePath,
    });
    const page = await browser.newPage();
    const cancelTimer = () => clearTimeout(timerRef);
    let dead = false;

    async function die(reason) {
      debug("die called with reason:", reason);
      if (dead) return;
      dead = true;

      cancelTimer();
      reject(reason);
    }

    page.on("error", function (err) {
      debug("error", err);
      die(err);
    });

    page.on("pageerror", function (err) {
      debug("pageerror", err);
      die(err);
    });

    // our "assertion framework" :)
    page.on("console", function (msg) {
      var text = msg.text();
      debug(`received text on browser console: "${text}"`);

      if (text.startsWith(OK)) {
        debug("success detected");
        cancelTimer();
        resolve();
      } else if (text.startsWith(FAILURE)) {
        debug("failure detected");
        die(text.substring(FAILURE.length + 1));
      } else {
        die("Do not print to console");
      }
    });

    try {
      await page.goto(`http://localhost:${port}`);
    } catch (err) {
      debug("page.goto threw");
      die(err);
      return;
    }
    await page.close();
    await browser.close();
  };

const createApp = ({ bundlePath, testScriptSource }) =>
  http.createServer((req, res) => {
    let body, type;

    const bundleFileName = basename(bundlePath);
    if (req.url.match(bundleFileName)) {
      const bundleSource = fs.readFileSync(bundlePath);
      body = bundleSource;
      type = "application/javascript";
    } else if (req.url.match(/\/helpers\.js/)) {
      body = helpersSource;
      type = "application/javascript";
    } else {
      body = htmlWithModuleScript(testScriptSource);
      type = "text/html";
    }

    const headers = {
      "Content-Length": Buffer.byteLength(body),
      "Content-Type": type,
    };
    res.writeHead(200, headers);
    res.end(body);
  });

async function run({
  bundlePath,
  testScriptSource,
  puppeteerExecutablePath,
  puppeteerArgs,
}) {
  const port = await getPort();
  assert(port);
  assert(testScriptSource);
  assert(bundlePath);

  debug("listening to port", port);

  const app = createApp({ bundlePath, testScriptSource });
  const p = new Promise((resolve, reject) => {
    app.listen(
      port,
      evaluatePageContent({
        resolve,
        reject,
        port,
        puppeteerArgs,
        puppeteerExecutablePath,
      })
    );
  });

  p.catch((err) => {
    app.close(() => debug("server has closed"));
  });

  p.then(() => app.close());

  return p;
}

module.exports = run;
