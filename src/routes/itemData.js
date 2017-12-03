"use strict";

const express = require("express");
const User = require("../models/User");
const ItemDataHelper = require("../models/helpers/ItemDataHelper");
const fs = require("fs");
const nconf = require("nconf");
const path = require("path");

const router = express.Router();

router.post("/", async (req, res) => {
  const account = await User.find({ where: { APIKey: req.body.APIKey } });
  if (account !== null) {
    ItemDataHelper.loadItems(req.body.items);
    res.json({});
  } else {
    res.status(401).json({ errors: { global: "Not authorized" } });
  }
});

router.post("/archive", async (req, res) => {
  const account = await User.find({ where: { APIKey: req.body.APIKey } });
  if (account !== null && req.body.archiveName) {
    const archivePath = path.resolve(nconf.get("base_dir"), nconf.get("archivePath"));
    fs.writeFileSync(path.join(archivePath, req.body.archiveName), Buffer.from(req.body.file.data));
    res.json({});
  } else {
    res.status(401).json({ errors: { global: "Not authorized" } });
  }
});

module.exports = router;
