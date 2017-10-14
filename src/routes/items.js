"use strict";

const express = require("express");
const Item = require("../models/static/S_Item");
const Sequelize = require("sequelize");

const router = express.Router();

const { fn, col, where } = Sequelize;

router.get("/:input", async (req, res) => {
  const inputValue = req.params.input.toLowerCase();

  const items = await Item.findAll({
    where: {
      name: where(fn("lower", col("name")), "LIKE", `%${inputValue}%`),
    },
    limit: 50,
  });
  res.json(items);
});

module.exports = router;
