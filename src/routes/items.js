"use strict";

const express = require("express");
const S_Item = require("../models/static/S_Item");
const S_PossibleEffect = require("../models/static/S_PossibleEffect");
const S_ItemType = require("../models/static/S_ItemType");
const S_Effect = require("../models/static/S_Effect");
const ItemStatHelper = require("../models/helpers/ItemStatHelper");
const Promisify = require("bluebird");
const async = Promisify.promisifyAll(require("async"));
const parseWhere = require("../models/helpers/ItemsConditionsHelper");

const router = express.Router();

router.post("/", async (req, res) => {
  const whereClause = parseWhere(req.body.where);
  console.log(whereClause);
  const items = await S_Item.findAll({
    where: whereClause,
    include: [
      {
        model: S_PossibleEffect,
        as: "possibleEffects",
        include: [{ model: S_Effect, as: "effect" }],
      },
      { model: S_ItemType, as: "type" },
    ],
    order: [["name", "ASC"]],
    limit: 50,
  });
  const itemsPriced = [];
  await async.eachAsync(items, async item => {
    const newItem = item.get({ plain: true });
    newItem.avgPrices = await ItemStatHelper.getLastAvgPrices(item.id);
    itemsPriced.push(newItem);
  });
  res.json(itemsPriced);
});

module.exports = router;
