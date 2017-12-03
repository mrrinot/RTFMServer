"use strict";

const express = require("express");
const S_Item = require("../models/static/S_Item");
const S_PossibleEffect = require("../models/static/S_PossibleEffect");
const S_ItemType = require("../models/static/S_ItemType");
const S_Effect = require("../models/static/S_Effect");
const ItemStatHelper = require("../models/helpers/ItemStatHelper");
const RecipeCostHelper = require("../models/helpers/RecipeCostHelper");
const RecipeCosts = require("../models/RecipeCosts");
const User = require("../models/User");
const Promisify = require("bluebird");
const async = Promisify.promisifyAll(require("async"));
const { parseWhere } = require("../models/helpers/ItemsConditionsHelper");
const { requiredAdminLevel } = require("../middlewares");
const _ = require("lodash");

const router = express.Router();

router.post("/", requiredAdminLevel(1), async (req, res) => {
  const whereClause = parseWhere(req.body.where);

  console.log("WHERE: ", whereClause);
  const ret = await RecipeCosts.findAll({
    where: whereClause.Recipe,
    include: [
      {
        model: S_Item,
        as: "item",
        where: whereClause.Item,
        include: [
          {
            model: S_PossibleEffect,
            as: "possibleEffects",
            include: [{ model: S_Effect, as: "effect" }],
          },
          { model: S_ItemType, as: "type" },
        ],
      },
    ],
    order: whereClause.Order,
    limit: 50,
  });
  const itemsPriced = [];
  await async.eachSeriesAsync(ret, async recipe => {
    const newRecipe = recipe.get({ plain: true });
    newRecipe.avgPrices = await ItemStatHelper.getLastAvgPrices(recipe.id);
    itemsPriced.push(newRecipe);
  });
  res.json(itemsPriced);
});

router.post("/compute", async (req, res) => {
  const account = await User.find({ where: { APIKey: req.body.APIKey } });
  if (account !== null) {
    await RecipeCostHelper.computeAllRecipeCost();
    res.json({});
  } else {
    res.status(401).json({ errors: { global: "Not authorized" } });
  }
});

module.exports = router;
