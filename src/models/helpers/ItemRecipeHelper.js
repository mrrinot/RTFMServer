"use strict";

const S_Item = require("../static/S_Item");
const S_Recipe = require("../static/S_Recipe");
const S_PossibleEffect = require("../static/S_PossibleEffect");
const S_ItemType = require("../static/S_ItemType");
const S_Effect = require("../static/S_Effect");
const Promisify = require("bluebird");
const async = Promisify.promisifyAll(require("async"));
const ItemStatHelper = require("./ItemStatHelper");
const _ = require("lodash");

class ItemRecipeHelper {
  static async getItemUsage(itemId) {
    const ret = await S_Recipe.findAll({
      include: [
        {
          model: S_Item,
          as: "ingredients",
          where: { id: itemId },
        },
      ],
    });
    const usedIn = [];
    await async.eachLimitAsync(ret, 6, async usage => {
      const item = await S_Item.findOne({
        where: {
          id: usage.resultId,
        },
        include: [
          {
            model: S_PossibleEffect,
            as: "possibleEffects",
            include: [{ model: S_Effect, as: "effect" }],
          },
          { model: S_ItemType, as: "type" },
        ],
      });
      const price = await ItemStatHelper.getLastPrices(item.id);
      usedIn.push({ item: item.get({ plain: true }), price });
    });
    return usedIn;
  }

  static async getAllIngredients(ingredients) {
    const quantities = {};
    _.each(ingredients, ing => {
      quantities[ing.id] = (quantities[ing.id] || 0) + ing.s_ingredient.quantity;
    });
    const allIng = [];
    const ret = await ItemRecipeHelper.getIngredientQuantitiesOf(quantities, ingredients, 1);
    await async.eachOfLimitAsync(ret, 10, async (quantity, id) => {
      const item = await S_Item.findOne({
        where: {
          id,
        },
        include: [
          {
            model: S_PossibleEffect,
            as: "possibleEffects",
            include: [{ model: S_Effect, as: "effect" }],
          },
          { model: S_ItemType, as: "type" },
        ],
      });
      const price = await ItemStatHelper.getLastPrices(id);
      allIng.push({ item, price, quantity });
    });
    return allIng;
  }

  static async getIngredientQuantitiesOf(quantities, ingredients, numberOfItem) {
    let newQuan = _.clone(quantities);
    await async.eachSeriesAsync(ingredients, async ing => {
      const isCraftable = await S_Recipe.findOne({
        where: { resultId: ing.id },
        include: [
          {
            model: S_Item,
            as: "ingredients",
          },
        ],
      });
      if (isCraftable !== null) {
        _.each(isCraftable.ingredients, craftIng => {
          newQuan[craftIng.id] =
            (newQuan[craftIng.id] || 0) + craftIng.s_ingredient.quantity * numberOfItem;
        });
        delete newQuan[ing.id];
        newQuan = await ItemRecipeHelper.getIngredientQuantitiesOf(
          newQuan,
          isCraftable.ingredients,
          ing.s_ingredient.quantity,
        );
      }
    });
    return newQuan;
  }

  static async getItemRecipe(itemId) {
    const ret = await S_Recipe.findOne({
      where: { resultId: itemId },
      include: [
        {
          model: S_Item,
          as: "ingredients",
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
    });
    const ingredients = [];
    await async.eachLimitAsync(ret.ingredients, 6, async ingredient => {
      const price = await ItemStatHelper.getLastPrices(ingredient.id);
      ingredients.push({ item: ingredient.get({ plain: true }), price });
    });
    const usedIn = await ItemRecipeHelper.getItemUsage(itemId);
    const allIngredients = await ItemRecipeHelper.getAllIngredients(ret.ingredients);
    return { ingredients, usedIn, allIngredients };
  }
}

module.exports = ItemRecipeHelper;
