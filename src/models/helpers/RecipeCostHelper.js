"use strict";

const RecipeCosts = require("../RecipeCosts");
const RecipeCostsTableIndex = require("../RecipeCostsTableIndex");
const S_Item = require("../static/S_Item");
const S_Recipe = require("../static/S_Recipe");
const ItemDataHelper = require("../helpers/ItemDataHelper");
const sequelize = require("../../sequelize");
const _ = require("lodash");
const Promisify = require("bluebird");
const winston = require("winston");
const async = Promisify.promisifyAll(require("async"));
const moment = require("moment");

const recipeTableInstances = {};
let craftableItemsList = [];

class RecipeCostHelper {
  static async createRecipeTableInstances(date) {
    const recipe = RecipeCosts(date);
    await sequelize.sync({ force: false });
    recipeTableInstances[date] = {
      RecipeCosts: recipe,
    };
  }

  static async loadAllModels() {
    const dates = await RecipeCostsTableIndex.findAll();
    await async.eachAsync(dates, async date => {
      await RecipeCostHelper.createRecipeTableInstances(date.get({ plain: true }).date);
    });
    const recipes = await S_Recipe.findAll({
      include: [
        {
          model: S_Item,
          as: "ingredients",
        },
      ],
    });
    craftableItemsList = _.keyBy(recipes, "resultId");
    winston.info("Loaded all recipe table models");
  }

  static async computeAllRecipeCost() {
    const thisWeek = moment().format("YYYY_W");
    console.log("This week is :", thisWeek);
    await RecipeCostsTableIndex.findOrCreate({
      where: { date: thisWeek },
      defaults: { date: thisWeek },
    });
    if (!recipeTableInstances[thisWeek]) {
      await RecipeCostHelper.createRecipeTableInstances(thisWeek);
    }
    const desc = ItemDataHelper.getLastItemDescription();
    const datas = await ItemDataHelper.getLastItemData().findAll({
      include: [{ model: desc, as: "itemDescriptions" }],
      order: [["timestamp", "DESC"]],
      group: ["itemId"],
    });
    const sortedDatas = _.keyBy(datas, "itemId");
    await async.eachOfLimitAsync(sortedDatas, 1, (data, itemId) => {
      console.log(data);
      console.log(craftableItemsList[itemId]);
    });
  }

  //   static getTable(date, tableType) {
  //     return recipeTableInstances[date][tableType];
  //   }

  //   static getItemData(date) {
  //     return RecipeCostHelper.getTable(date, "ItemData");
  //   }

  //   static getItemDescription(date) {
  //     return RecipeCostHelper.getTable(date, "ItemDescription");
  //   }

  //   static getItemDescriptionEffect(date) {
  //     return RecipeCostHelper.getTable(date, "ItemDescriptionEffect");
  //   }

  //   static getLastTable(tableType) {
  //     const ret = _.max(Object.keys(recipeTableInstances));
  //     return recipeTableInstances[ret][tableType];
  //   }

  //   static getLastItemData() {
  //     return RecipeCostHelper.getLastTable("ItemData");
  //   }

  //   static getLastItemDescription() {
  //     return RecipeCostHelper.getLastTable("ItemDescription");
  //   }

  //   static getLastItemDescriptionEffect() {
  //     return RecipeCostHelper.getLastTable("ItemDescriptionEffect");
  //   }

  //   static async executeQueryOnDates(dates, fn) {
  //     const ret = [];
  //     await async.eachOfLimitAsync(dates, 6, async (date, key) => {
  //       if (_.indexOf(Object.keys(recipeTableInstances), date) !== -1) {
  //         const result = await fn(date);
  //         if (result !== null) {
  //           ret[key] = result;
  //         }
  //       }
  //     });
  //     return ret;
  //   }

  //   static async executeQueryOnTimestamps(timestamps, fn) {
  //     const ret = [];
  //     await async.eachOfLimitAsync(timestamps, 6, async (timestamp, key) => {
  //       const date = new Date(timestamp).format("yyyy_mm_dd");
  //       if (_.indexOf(Object.keys(recipeTableInstances), date) !== -1) {
  //         const result = await fn(date);
  //         if (result !== null) {
  //           ret[key] = result;
  //         }
  //       }
  //     });
  //     return ret;
  //   }

  //   static async executeQueryOnAllDates(fn) {
  //     const ret = await RecipeCostHelper.executeQueryOnDates(Object.keys(recipeTableInstances), fn);
  //     return ret;
  //   }
}
module.exports = RecipeCostHelper;
