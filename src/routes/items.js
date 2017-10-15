"use strict";

const express = require("express");
const S_Item = require("../models/static/S_Item");
const S_PossibleEffect = require("../models/static/S_PossibleEffect");
const Sequelize = require("sequelize");

const router = express.Router();

const { fn, col, where } = Sequelize;

router.get("/:input", async (req, res) => {
  const inputValue = req.params.input.toLowerCase();

  const items = await S_Item.findAll({
    where: {
      name: where(fn("lower", col("name")), "LIKE", `%${inputValue}%`),
    },
    include: [{ model: S_PossibleEffect, as: "possibleEffects" }],
    limit: 50,
  });
  res.json(items);
});

module.exports = router;
