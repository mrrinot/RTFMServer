"use strict";

const express = require("express");
const S_Item = require("../models/static/S_Item");
const S_PossibleEffect = require("../models/static/S_PossibleEffect");
const S_ItemType = require("../models/static/S_ItemType");
const S_Effect = require("../models/static/S_Effect");
const S_Server = require("../models/static/S_Server");
const ItemStatHelper = require("../models/helpers/ItemStatHelper");
const ItemDataHelper = require("../models/helpers/ItemDataHelper");
const RecipeCostHelper = require("../models/helpers/RecipeCostHelper");
const Promisify = require("bluebird");
const async = Promisify.promisifyAll(require("async"));
const { parseWhere } = require("../models/helpers/ItemsConditionsHelper");
const _ = require("lodash");

const router = express.Router();

router.post("/", async (req, res) => {
  const whereClause = parseWhere(req.body.where);

  console.log(whereClause);
  const ret = await RecipeCostHelper.getLastRecipeTable().findAll({
    where: {},
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

module.exports = router;
