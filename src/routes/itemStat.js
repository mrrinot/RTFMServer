"use strict";

const express = require("express");
const S_Item = require("../models/static/S_Item");
const S_PossibleEffect = require("../models/static/S_PossibleEffect");
const S_ItemType = require("../models/static/S_ItemType");
const S_Effect = require("../models/static/S_Effect");
const S_Server = require("../models/static/S_Server");
const ItemStatHelper = require("../models/helpers/ItemStatHelper");
const ItemDataHelper = require("../models/helpers/ItemDataHelper");
const ItemRecipeHelper = require("../models/helpers/ItemRecipeHelper");
const _ = require("lodash");
const Sequelize = require("sequelize");

const { Op } = Sequelize;
const router = express.Router();

router.get("/:itemId", async (req, res) => {
  const item = await S_Item.findOne({
    where: {
      id: req.params.itemId,
    },
    include: [
      {
        model: S_PossibleEffect,
        as: "possibleEffects",
        include: [{ model: S_Effect, as: "effect" }],
      },
      { model: S_ItemType, as: "type" },
    ],
  });
  if (item !== null) {
    const prices = await ItemStatHelper.getItemPrices(item.id);
    const dates = await ItemStatHelper.getDatesWithItemPrices(item.id);
    const recipe = await ItemRecipeHelper.getItemRecipe(item.id);
    // console.log("recipe ", recipe);
    const resData = {
      item: item.get({ plain: true }),
      prices,
      dates,
      recipe,
    };
    res.json(resData);
  } else {
    res.status(404).json({ errors: { global: "Item not found" } });
  }
});

router.post("/additional", async (req, res) => {
  const { range, first, last, itemId } = req.body;
  const upTo = last - range;
  const dayMill = 24 * 60 * 60 * 1000;
  if (!range || upTo > first) return res.json([]);
  const dates = [];
  for (let i = upTo; i <= last; i += dayMill) {
    dates.push(new Date(i).format("yyyy_mm_dd"));
  }
  const ret = await ItemDataHelper.executeQueryOnDates(
    dates,
    async date =>
      await ItemDataHelper.getTable(date, "ItemData").findAll({
        where: { itemId, timestamp: { [Op.lt]: first } },
        include: [
          { model: S_Server, as: "server" },
          {
            model: ItemDataHelper.getTable(date, "ItemDescription"),
            as: "itemDescriptions",
          },
        ],
        order: [["timestamp", "ASC"]],
      }),
  );
  res.json(
    _.chain(ret)
      .flatten()
      .compact()
      .value(),
  );
});

router.post("/effects/", async (req, res) => {
  const day = new Date(req.body.itemDesc.timestamp).format("yyyy_mm_dd");
  const effects = await ItemDataHelper.getItemDescriptionEffect(day).findAll({
    where: { itemDescriptionId: { [Op.in]: req.body.itemDesc.ids } },
    include: [{ model: S_Effect, as: "effect" }],
  });
  const result = {};
  _.each(effects, effect => {
    const temp = effect.get({ plain: true });
    if (!result[temp.itemDescriptionId]) result[temp.itemDescriptionId] = [];
    result[temp.itemDescriptionId].push(temp);
  });
  res.json(result);
});

module.exports = router;
