"use strict";

const RecipeCosts = require("../RecipeCosts");
const RecipeCostsTableIndex = require("../RecipeCostsTableIndex");
const S_Item = require("../static/S_Item");
const S_Recipe = require("../static/S_Recipe");
const ItemDataHelper = require("../helpers/ItemDataHelper");
const ItemRecipeHelper = require("../helpers/ItemRecipeHelper");
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
    await sequelize.sync({ force: false });
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
    const allIngRecipes = [];
    await async.eachLimitAsync(recipes, 10, async recipe => {
      const allIngredients = await ItemRecipeHelper.getAllIngredients(recipe.ingredients, false);
      allIngRecipes.push({ allIngredients, resultId: recipe.resultId, jobId: recipe.jobId });
    });
    craftableItemsList = _.keyBy(allIngRecipes, "resultId");
    winston.info("Loaded all recipe table models");
  }

  static calculateLowestActualPrice(data) {
    const lowest = _.chain(data.itemDescriptions)
      .sortBy([
        desc => parseInt(desc.prices[0], 10),
        desc => parseInt(desc.prices[1], 10),
        desc => parseInt(desc.prices[2], 10),
      ])
      .first()
      .value();
    // if (lowest.prices[0] === 48999) {
    //   console.log(data.itemDescriptions);
    // }
    let avg = 0;
    let cpt = 0;
    _.forEach(lowest.prices, (descPrices, quant) => {
      if (descPrices !== 0) {
        avg += descPrices / 10 ** quant;
        cpt++;
      }
    });
    avg /= cpt;
    return Math.round(avg);
  }

  static calculateTotalPrices(itemDatas, recipe) {
    const ret = { avg: { price: 0, unknown: false }, actual: { price: 0, unknown: false } };
    _.each(recipe, ing => {
      const itemData = itemDatas[ing.item.id];
      if (itemData !== undefined) {
        const lowest = RecipeCostHelper.calculateLowestActualPrice(itemData);
        ret.avg.price += itemData.averagePrice * ing.quantity;
        ret.actual.price += lowest * ing.quantity;
      } else {
        ret.avg.unknown = true;
        ret.actual.unknown = true;
      }
    });
    ret.avg.price = Math.round(ret.avg.price);
    ret.actual.price = Math.round(ret.actual.price);
    return ret;
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
    const descInstance = ItemDataHelper.getLastItemDescription();
    const datas = await ItemDataHelper.getLastItemData().findAll({
      include: [{ model: descInstance, as: "itemDescriptions" }],
      order: [["timestamp", "DESC"]],
    });
    const sortedDatas = _.chain(datas)
      .orderBy("timestamp")
      .keyBy("itemId")
      .value();
    const recipeCostList = [];
    winston.info(`There is ${Object.keys(sortedDatas).length} different items to be treated`);
    _.forEach(sortedDatas, (data, itemId) => {
      const recipe = craftableItemsList[itemId];
      if (recipe) {
        const lowest = RecipeCostHelper.calculateLowestActualPrice(data);
        const totals = RecipeCostHelper.calculateTotalPrices(sortedDatas, recipe.allIngredients);
        if (data.averagePrice === -1) totals.avg.unknown = true;
        recipeCostList.push({
          itemId: data.itemId,
          serverId: data.serverId,
          timestamp: data.timestamp,
          averagePrice: data.averagePrice,
          lowestActualPrice: lowest,
          averageCostDifference: data.averagePrice - totals.avg.price,
          actualCostDifference: lowest - totals.actual.price,
          averageCostDifferencePercentage:
            (data.averagePrice - totals.avg.price) / data.averagePrice * 100,
          actualCostDifferencePercentage: (lowest - totals.actual.price) / lowest * 100,
          totalIngredientsAveragePrice: totals.avg.price,
          totalIngredientsActualPrice: totals.actual.price,
          containsAverageUnknown: totals.avg.unknown,
          containsActualUnknown: totals.actual.unknown,
        });
      }
    });
    winston.info("Finished processing recipes cost, inserting into database");
    const ret = await recipeTableInstances[thisWeek].RecipeCosts.bulkCreate(recipeCostList, {
      validate: true,
      returning: true,
    });
    winston.info(`Finished adding ${ret.length} recipes cost`);
  }

  static getRecipeTable(date) {
    return recipeTableInstances[date].RecipeCosts;
  }

  static getLastRecipeTable() {
    const ret = _.max(Object.keys(recipeTableInstances));
    return recipeTableInstances[ret].RecipeCosts;
  }

  static async executeQueryOnDates(dates, fn) {
    const ret = [];
    await async.eachOfLimitAsync(dates, 6, async (date, key) => {
      if (_.indexOf(Object.keys(recipeTableInstances), date) !== -1) {
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
      if (_.indexOf(Object.keys(recipeTableInstances), date) !== -1) {
        const result = await fn(date);
        if (result !== null) {
          ret[key] = result;
        }
      }
    });
    return ret;
  }

  static async executeQueryOnAllDates(fn) {
    const ret = await RecipeCostHelper.executeQueryOnDates(Object.keys(recipeTableInstances), fn);
    return ret;
  }
}
module.exports = RecipeCostHelper;
