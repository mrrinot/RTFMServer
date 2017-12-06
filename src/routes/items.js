"use strict";

const express = require("express");
const S_Item = require("../models/static/S_Item");
const S_PossibleEffect = require("../models/static/S_PossibleEffect");
const S_ItemType = require("../models/static/S_ItemType");
const S_Effect = require("../models/static/S_Effect");
const S_Server = require("../models/static/S_Server");
const ItemStatHelper = require("../models/helpers/ItemStatHelper");
const ItemDataHelper = require("../models/helpers/ItemDataHelper");
const Promisify = require("bluebird");
const async = Promisify.promisifyAll(require("async"));
const { parseWhere } = require("../models/helpers/ItemsConditionsHelper");
const _ = require("lodash");

const router = express.Router();

router.post("/", async (req, res) => {
  const whereClause = parseWhere(req.body.where);
  if (Object.keys(whereClause.Data).length === 0) {
    const items = await S_Item.findAll({
      where: whereClause.Item,
      include: [
        {
          model: S_PossibleEffect,
          as: "possibleEffects",
          include: [{ model: S_Effect, as: "effect" }],
        },
        { model: S_ItemType, as: "type" },
      ],
      order: [["name", "ASC"]],
      logging: console.log,
      limit: 50,
    });
    const itemsPriced = [];
    await async.eachSeriesAsync(items, async item => {
      const newItem = item.get({ plain: true });
      newItem.avgPrices = await ItemStatHelper.getLastAvgPrices(item.id);
      itemsPriced.push(newItem);
    });
    res.json(itemsPriced);
  } else {
    const datas = await ItemDataHelper.getLastItemData().findAll({
      where: whereClause.Data,
      include: [
        { model: S_Server, as: "server" },
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
      order: [["averagePrice", "DESC"], ["timestamp", "DESC"]],
      group: ["item.id"],
      limit: 50,
    });
    const items = [];
    _.each(datas, data => {
      const temp = data.get({ plain: true });
      const newItem = temp.item;
      newItem.avgPrices = [
        {
          id: temp.id,
          averagePrice: temp.averagePrice,
          timestamp: temp.timestamp,
          serverId: temp.serverId,
          server: temp.server,
        },
      ];
      items.push(newItem);
    });
    res.json(items);
  }
});

router.get("/types", async (req, res) => {
  const itemsTypes = await S_ItemType.findAll();
  res.json({ itemsTypes });
});

module.exports = router;
