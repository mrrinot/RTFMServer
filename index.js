"use strict";

require("./src/tools/confSetup");
const Sequelize = require("sequelize");
const winston = require("winston");
const nconf = require("nconf");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = require("express")();
const serveStatic = require("serve-static");

const Item = require("./src/models/Item");
const User = require("./src/models/User");

app.use(bodyParser.json());

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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const account = await User.find({
    where: {
      email,
    },
  });
  if (account !== null) {
    const isValid = await account.isValidPassword(password);
    if (isValid) {
      res.json(account.toAuthJSON());
    } else {
      res.status(400).json({ errors: { global: "Invalid credentials" } });
    }
  } else {
    res.status(400).json({ errors: { global: "This email isn't linked to any account" } });
  }
});

app.listen(8080, () => {
  winston.info("server running !");
});
