"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../../sequelize");
const S_Item = require("../static/S_Item");
const S_ItemType = require("../static/S_ItemType");
const S_Ingredient = require("../static/S_Ingredient");
const S_Recipe = require("../static/S_Recipe");
const S_Effect = require("../static/S_Effect");
const S_Server = require("../static/S_Server");
const S_PossibleEffect = require("../static/S_PossibleEffect");
const ItemData = require("../ItemData");
const ItemDescription = require("../ItemDescription");
const ItemDescriptionEffect = require("../ItemDescriptionEffect");
const Promisify = require("bluebird");
const async = Promisify.promisifyAll(require("async"));

class ItemStatHelper {
  static async getLastAvgPrices(itemId) {
    const avgs = await ItemData.findAll({
      where: { itemId },
      include: [{ model: S_Server, as: "server" }],
      order: [["timestamp", "DESC"]],
      group: ["serverID"],
    });
    return avgs;
  }

  static async getItemPrices(itemId) {
    const res = await ItemData.findAll({
      where: { itemId },
      include: [
        { model: S_Server, as: "server" },
        {
          model: ItemDescription,
          as: "itemDescriptions",
        },
      ],
      order: [["timestamp", "ASC"]],
    });
    return res;
  }
}

module.exports = ItemStatHelper;
