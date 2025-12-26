// server.js
const { createServer } = require("https");
const { readFileSync } = require("fs");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Make sure these match your newly generated mkcert files
const httpsOptions = {
  key: readFileSync("./192.168.18.59+1-key.pem"),
  cert: readFileSync("./192.168.18.59+1.pem"),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    handle(req, res);
  }).listen(3000, "0.0.0.0", (err) => {
    if (err) throw err;
    console.log("HTTPS Frontend running on https://192.168.18.59:3000");
  });
});
