"use strict";

const ItemData = require("../ItemData");
const ItemDescription = require("../ItemDescription");
const ItemDescriptionEffect = require("../ItemDescriptionEffect");
const ItemDataTableIndex = require("../ItemDataTableIndex");
const StaticDataHelper = require("./StaticDataHelper");
const sequelize = require("../../sequelize");
const _ = require("lodash");
const Promisify = require("bluebird");
const winston = require("winston");
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

  static async loadAllModels() {
    const dates = await ItemDataTableIndex.findAll();
    await async.eachAsync(dates, async date => {
      await ItemDataHelper.createItemTableInstances(date.get({ plain: true }).date);
    });
    winston.info("Loaded all item table models");
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
      await ItemDataTableIndex.findOrCreate({ where: { date }, defaults: { date } });
      if (!itemTableInstances[date]) {
        await ItemDataHelper.createItemTableInstances(date);
      }
      await ItemDataHelper.addItemsToTable(date, itemList);
    });
  }

  static getTable(date, tableType) {
    return itemTableInstances[date][tableType];
  }

  static getItemData(date) {
    return ItemDataHelper.getTable(date, "ItemData");
  }

  static getItemDescription(date) {
    return ItemDataHelper.getTable(date, "ItemDescription");
  }

  static getItemDescriptionEffect(date) {
    return ItemDataHelper.getTable(date, "ItemDescriptionEffect");
  }

  static getLastTable(tableType) {
    const ret = _.max(Object.keys(itemTableInstances));
    return itemTableInstances[ret][tableType];
  }

  static getLastItemData() {
    return ItemDataHelper.getLastTable("ItemData");
  }

  static getLastItemDescription() {
    return ItemDataHelper.getLastTable("ItemDescription");
  }

  static getLastItemDescriptionEffect() {
    return ItemDataHelper.getLastTable("ItemDescriptionEffect");
  }

  static async executeQueryOnDates(dates, fn) {
    const ret = [];
    await async.eachOfLimitAsync(dates, 6, async (date, key) => {
      if (_.indexOf(Object.keys(itemTableInstances), date) !== -1) {
        const result = await fn(date);
        if (result !== null) {
          ret[key] = result;
        }
      }
    });
    return ret;
  }

  static async executeQueryOnTimestamps(timestamps, fn) {
    const ret = [];
    await async.eachOfLimitAsync(timestamps, 6, async (timestamp, key) => {
      const date = new Date(timestamp).format("yyyy_mm_dd");
      if (_.indexOf(Object.keys(itemTableInstances), date) !== -1) {
        const result = await fn(date);
        if (result !== null) {
          ret[key] = result;
        }
      }
    });
    return ret;
  }

  static async executeQueryOnAllDates(fn) {
    const ret = await ItemDataHelper.executeQueryOnDates(Object.keys(itemTableInstances), fn);
    return ret;
  }
}
module.exports = ItemDataHelper;
