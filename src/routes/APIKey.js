"use strict";

const express = require("express");
const User = require("../models/User");
const Sequelize = require("sequelize");
const uuid = require("uuid/v4");

const router = express.Router();

const { fn, col, where } = Sequelize;

router.post("/", async (req, res) => {
  if (req.isAuthenticated()) {
    const account = await User.findById(req.user.id);
    account.APIKey = uuid();
    account.save();
    res.json({ key: account.APIKey });
  } else {
    res.status(401).json({ errors: { global: "Please login." } });
  }
});

module.exports = router;