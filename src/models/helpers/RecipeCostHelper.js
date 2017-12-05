"use strict";

const RecipeCosts = require("../RecipeCosts");
const S_Item = require("../static/S_Item");
const S_Recipe = require("../static/S_Recipe");
const ItemDataHelper = require("../helpers/ItemDataHelper");
const ItemRecipeHelper = require("../helpers/ItemRecipeHelper");
const _ = require("lodash");
const Promisify = require("bluebird");
const winston = require("winston");
const async = Promisify.promisifyAll(require("async"));

let craftableItemsList = [];

class RecipeCostHelper {
  static async loadAllModels() {
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
    winston.verbose("Loaded all recipe");
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
    winston.verbose(`There is ${Object.keys(sortedDatas).length} different items to be treated`);
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
    winston.verbose("Finished processing recipes cost, droping database, then inserting");
    await RecipeCosts.sync({ force: true });
    const ret = await RecipeCosts.bulkCreate(recipeCostList, {
      validate: true,
      returning: true,
    });
    winston.verbose(`Finished adding ${ret.length} recipes cost`);
  }
}
module.exports = RecipeCostHelper;
