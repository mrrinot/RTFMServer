"use strict";

const express = require("express");
const User = require("../models/User");
const ItemData = require("../models/ItemData");
const ItemDescription = require("../models/ItemDescription");
const StaticDataHelper = require("../models/helpers/StaticDataHelper");
const ItemDescriptionEffect = require("../models/ItemDescriptionEffect");
const _ = require("lodash");

const router = express.Router();

router.post("/", async (req, res) => {
  const account = await User.find({ where: { APIKey: req.body.APIKey } });
  if (account !== null) {
    const datas = await ItemData.bulkCreate(req.body.items, { validate: true, returning: true });
    const descriptions = [];
    const effects = [];
    req.body.items.forEach((item, key) => {
      item.itemDescriptions.forEach(desc => {
        descriptions.push({ ...desc, itemDatumId: datas[key].id });
      });
    });
    const descDatas = await ItemDescription.bulkCreate(descriptions, {
      validate: true,
      returning: true,
    });

    descriptions.forEach((desc, key) => {
      desc.effects.forEach(effect => {
        if (_.find(StaticDataHelper.S_Effect, { effectId: effect.actionId })) {
          effects.push({
            effectId: effect.actionId,
            description: ItemDescriptionEffect.getDescription(effect),
            itemDescriptionId: descDatas[key].id,
          });
        }
      });
    });
    await ItemDescriptionEffect.bulkCreate(effects, { validate: true });

    console.log(
      `Done inserting ${req.body.items
        .length} items with ${descriptions.length} descriptions and ${effects.length} effects`,
    );
    res.json({});
  } else {
    res.status(401).json({ errors: { global: "Not authorized" } });
  }
});

module.exports = router;
