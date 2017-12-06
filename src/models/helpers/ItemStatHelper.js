"use strict";

const S_Server = require("../static/S_Server");
const ItemDataHelper = require("./ItemDataHelper");
const Sequelize = require("sequelize");
const _ = require("lodash");

const { Op } = Sequelize;

class ItemStatHelper {
  static async getLastAvgPrices(itemId) {
    const avgs = await ItemDataHelper.getLastItemData().findAll({
      where: { itemId },
      include: [{ model: S_Server, as: "server" }],
      order: [["timestamp", "DESC"]],
    });
    return _.chain(avgs)
      .orderBy("timestamp")
      .keyBy("serverId")
      .toArray()
      .value();
  }

  static async getLastPrices(itemId) {
    const desc = ItemDataHelper.getLastItemDescription();
    const prices = await ItemDataHelper.getLastItemData().findAll({
      where: { itemId },
      include: [{ model: S_Server, as: "server" }, { model: desc, as: "itemDescriptions" }],
      order: [["timestamp", "DESC"]],
    });
    return _.chain(prices)
      .orderBy("timestamp")
      .keyBy("serverId")
      .toArray()
      .value();
  }

  static async getItemPrices(itemId) {
    const latestPrice = await ItemStatHelper.getLastAvgPrices(itemId);
    const timestamp = latestPrice.length > 0 ? latestPrice[0].timestamp : Date.now();
    const res = await ItemDataHelper.executeQueryOnTimestamps(
      [timestamp - 24 * 60 * 60 * 1000, timestamp],
      async date =>
        await ItemDataHelper.getTable(date, "ItemData").findAll({
          where: { itemId, timestamp: { [Op.gte]: timestamp - 24 * 60 * 60 * 1000 } },
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
    return _.flatten(res);
  }

  static async getDatesWithItemPrices(itemId) {
    const res = await ItemDataHelper.executeQueryOnAllDates(async date => {
      const ret = await ItemDataHelper.getTable(date, "ItemData").findOne({
        where: { itemId },
      });
      return ret !== null
        ? new Date(ret.get({ plain: true }).timestamp).format("yyyy_mm_dd")
        : null;
    });
    return res.sort();
  }
}

module.exports = ItemStatHelper;
