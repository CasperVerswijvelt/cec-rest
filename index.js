import CecController from "cec-controller";
import express from "express";

// Util

const log = (text) => {
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getDate()} ${String(date.getHours()).padStart(
    2,
    "0"
  )}:${String(date.getMinutes()).padStart(2, "0")}:${String(
    date.getSeconds()
  ).padStart(2, "0")}`;
  console.log(`[${formattedDate}] ${text}`);
};
const getActualRequestDurationInMilliseconds = (start) => {
  const NS_PER_SEC = 1e9; // convert to nanoseconds
  const NS_TO_MS = 1e6; // convert to milliseconds
  const diff = process.hrtime(start);
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

// Start CEC Controller
const cecCtrl = new CecController();
let controller = {};
cecCtrl.on("ready", (ctrl) => {
  controller = ctrl;
  log("CEC Controller is ready");
});

// HTTP REST Server
const app = express();
const HTTP_PORT = 3000;

const K_ADDRESS = "address";
const K_PROPERTY = "property";
const K_ACTION = "action";
const K_DATA = "data";

const ERR_UNKNOWN_DEVICE = "Unknown device";
const ERR_UNKNOWN_PROPERTY = "Unknown property";
const ERR_INVALID_ACTION = "Invalid action";

// JSON body parsing and parse error handling
app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).send(err.message);
  }
  next();
});

// Request logging
app.use((req, res, next) => {
  const start = process.hrtime();
  const logEvt = (event) => {
    log(
      `${req.method} ${req.url} ${
        req.method !== "GET" ? `${JSON.stringify(req.body)} ` : " "
      }${res.statusCode} ${getActualRequestDurationInMilliseconds(
        start
      ).toLocaleString()} ms [${event}]`
    );
  };
  if (req.method !== "GET") logEvt("S");
  res.on("finish", logEvt.bind(null, "F"));
  res.on("closed", logEvt.bind(null, "C"));
  next();
});

const includeFunction = (key, val) => {
  return typeof val === "function" ? "[function]" : val;
};

// Routes
app.get("/", (req, res) => {
  res.header("Content-Type", "application/json");
  res.send(JSON.stringify(controller, includeFunction, 2));
});
app.get(`/:${K_ADDRESS}`, (req, res) => {
  const device = controller[req.params.address];
  if (device) {
    return res.send(JSON.stringify(device, includeFunction, 2));
  }
  res.status(404).send(ERR_UNKNOWN_DEVICE);
});
app.get(`/:${K_ADDRESS}/:${K_PROPERTY}`, (req, res) => {
  const device = controller[req.params.address];
  if (device) {
    const prop = device[req.params[K_PROPERTY]];
    if (prop && typeof prop !== "function") {
      return res.send(prop);
    }
    return res.status(404).send(ERR_UNKNOWN_PROPERTY);
  }
  return res.status(404).send(ERR_UNKNOWN_DEVICE);
});
app.post(`/:${K_ADDRESS}`, async (req, res) => {
  const device = controller[req.params[K_ADDRESS]];
  if (device) {
    if (
      req.body &&
      typeof req.body[K_ACTION] === "string" &&
      typeof device[req.body[K_ACTION]] === "function"
    ) {
      const functionResult = device[req.body[K_ACTION]](req.body[K_DATA]);
      if (typeof functionResult.then === "function") {
        try {
          const result = await functionResult;
          return res.send(result);
        } catch (e) {
          return res.status(500).send(`Failed to execute action: ${e}`);
        }
      }
      return res.status(500).send("No promise result, contact developer");
    }
    return res.status(400).send(ERR_INVALID_ACTION);
  }
  return res.status(404).send(ERR_UNKNOWN_DEVICE);
});

app.listen(HTTP_PORT, () => {
  log(`CEC Web API listening on port ${HTTP_PORT}`);
});
