"use strict";

const express = require("express");
const S_Item = require("../models/static/S_Item");
const S_PossibleEffect = require("../models/static/S_PossibleEffect");
const S_ItemType = require("../models/static/S_ItemType");
const S_Effect = require("../models/static/S_Effect");
const ItemStatHelper = require("../models/helpers/ItemStatHelper");
const ItemDataHelper = require("../models/helpers/ItemDataHelper");
const _ = require("lodash");
const Sequelize = require("sequelize");

const { Op } = Sequelize;
const router = express.Router();

router.get("/:itemId", async (req, res) => {
  const item = await S_Item.find({
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
    const resData = {
      item: item.get({ plain: true }),
      prices,
    };
    res.json(resData);
  } else {
    res.status(404).json({ errors: { global: "Item not found" } });
  }
});

router.post("/effects/", async (req, res) => {
  const ItemDescriptionEffectTable = await ItemDataHelper.getLastItemDescriptionEffect();
  const effects = await ItemDescriptionEffectTable.findAll({
    where: { itemDescriptionId: { [Op.in]: req.body.itemDescIds } },
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
