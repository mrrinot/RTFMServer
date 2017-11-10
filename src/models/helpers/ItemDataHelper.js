"use strict";

const ItemData = require("../ItemData");
const ItemDescription = require("../ItemDescription");
const ItemDescriptionEffect = require("../ItemDescriptionEffect");
const TableSummary = require("../TableSummary");
const StaticDataHelper = require("./StaticDataHelper");
const sequelize = require("../../sequelize");
const _ = require("lodash");
const Promisify = require("bluebird");
const async = Promisify.promisifyAll(require("async"));

const itemTableInstances = {};

class ItemDataHelper {
  static async createItemTableInstances(date) {
    const effect = ItemDescriptionEffect(date);
    const desc = ItemDescription(date, effect);
    const data = ItemData(date, desc);
    await sequelize.sync({ force: false });
    itemTableInstances[date] = {
      ItemData: data,
      ItemDescription: desc,
      ItemDescriptionEffect: effect,
    };
  }

  static async addItemsToTable(date, items) {
    const datas = await itemTableInstances[date].ItemData.bulkCreate(items, {
      validate: true,
      returning: true,
    });
    const descriptions = [];
    const effects = [];
    items.forEach((item, key) => {
      item.itemDescriptions.forEach(desc => {
        descriptions.push({ ...desc, itemDatumId: datas[key].id });
      });
    });
    const descDatas = await itemTableInstances[date].ItemDescription.bulkCreate(descriptions, {
      validate: true,
      returning: true,
    });
    descriptions.forEach((desc, key) => {
      desc.effects.forEach(effect => {
        if (_.find(StaticDataHelper.Effects, { id: effect.actionId })) {
          effects.push({
            effectId: effect.actionId,
            description: itemTableInstances[date].ItemDescriptionEffect.getDescription(effect),
            itemDescriptionId: descDatas[key].id,
          });
        }
      });
    });
    await itemTableInstances[date].ItemDescriptionEffect.bulkCreate(effects, { validate: true });
  }

  static async loadItems(items) {
    const sorted = {};
    _.each(items, item => {
      const date = new Date(item.timestamp).format("yyyy_mm_dd");
      (sorted[date] = sorted[date] || []).push(item);
    });
    await async.eachOfLimitAsync(sorted, 4, async (itemList, date) => {
      await TableSummary.findOrCreate({ where: { date }, defaults: { date } });
      if (!itemTableInstances[date]) {
        await ItemDataHelper.createItemTableInstances(date);
      }
      await ItemDataHelper.addItemsToTable(date, itemList);
    });
  }

  static async getLastTable(tableType) {
    const lastDay = await TableSummary.findOne({ order: [["date", "DESC"]], limit: 1 });
    const { date } = lastDay.get({ plain: true });
    if (!itemTableInstances[date]) {
      await ItemDataHelper.createItemTableInstances(date);
    }
    return itemTableInstances[date][tableType];
  }

  static async getLastItemData() {
    const ret = await ItemDataHelper.getLastTable("ItemData");
    return ret;
  }

  static async getLastItemDescription() {
    const ret = await ItemDataHelper.getLastTable("ItemDescription");
    return ret;
  }

  static async getLastItemDescriptionEffect() {
    const ret = await ItemDataHelper.getLastTable("ItemDescriptionEffect");
    return ret;
  }
}
module.exports = ItemDataHelper;
