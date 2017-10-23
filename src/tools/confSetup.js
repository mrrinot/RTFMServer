"use strict";

const path = require("path");
const nconf = require("nconf");
const winston = require("winston");
require("./date.format");

nconf.overrides({
  base_dir: process.cwd(),
  prod: process.env.NODE_ENV === "production",
  dev: process.env.NODE_ENV !== "production",
});

nconf.argv();
nconf.env();

nconf.defaults({
  config: "config.json",
  bcrypt_rounds: 12,
});

const configFile = path.resolve(nconf.get("base_dir"), nconf.get("config"));
nconf.file(configFile);

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  colorize: true,
  timestamp() {
    const date = new Date();
    return `${date.format("yyyy/mm/dd HH:MM:ss.l")}`;
  },
  level: nconf.get("verbose") ? "verbose" : "info",
  json: false,
  stringify: true,
});
