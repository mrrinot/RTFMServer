"use strict";

const S_Server = require("../static/S_Server");
const ItemDataHelper = require("./ItemDataHelper");

class ItemStatHelper {
  static async getLastAvgPrices(itemId) {
    const ItemDataTable = await ItemDataHelper.getLastItemData();
    const avgs = await ItemDataTable.findAll({
      where: { itemId },
      include: [{ model: S_Server, as: "server" }],
      order: [["timestamp", "DESC"]],
      group: ["serverID"],
    });
    return avgs;
  }

  static async getItemPrices(itemId) {
    const ItemDataTable = await ItemDataHelper.getLastItemData();
    const ItemDescriptionTable = await ItemDataHelper.getLastItemDescription();
    const res = await ItemDataTable.findAll({
      where: { itemId },
      include: [
        { model: S_Server, as: "server" },
        {
          model: ItemDescriptionTable,
          as: "itemDescriptions",
        },
      ],
      order: [["timestamp", "ASC"]],
    });
    return res;
  }
}

module.exports = ItemStatHelper;
