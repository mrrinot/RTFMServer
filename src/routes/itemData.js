"use strict";

const express = require("express");
const User = require("../models/User");
const ItemDataHelper = require("../models/helpers/ItemDataHelper");

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

module.exports = router;
