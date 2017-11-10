"use strict";

const express = require("express");
const User = require("../models/User");
const uuid = require("uuid/v4");

const router = express.Router();

router.post("/", async (req, res) => {
  const account = await User.findById(req.user.id);
  account.APIKey = uuid();
  account.save();
  res.json({ key: account.APIKey });
});

module.exports = router;
