"use strict";

require("./src/tools/confSetup");
const Sequelize = require("sequelize");
const winston = require("winston");
const nconf = require("nconf");
const path = require("path");
const fs = require("fs");
const app = require("express")();
const serveStatic = require("serve-static");

const Item = require("./src/models/Item");

let iconsPath = nconf.get("iconsPath");

if (iconsPath) {
  iconsPath = path.resolve(process.cwd(), iconsPath);
  if (fs.existsSync(iconsPath) && fs.lstatSync(iconsPath).isDirectory()) {
    winston.info(`Using ${iconsPath} as icon directory.`);
    app.use("/img/", serveStatic(iconsPath));
  }
}

const { Op, fn, col, where } = Sequelize;

app.get("/items/:input", async (req, res) => {
  const inputValue = req.params.input.toLowerCase();

  const items = await Item.findAll({
    where: {
      name: where(fn("lower", col("name")), "LIKE", `%${inputValue}%`),
    },
    limit: 50,
  });
  res.json(items);
});

app.listen(8080, () => {
  winston.info("server running !");
});
