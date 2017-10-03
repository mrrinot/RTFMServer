"use strict";

require("./models/User");
const Recipe = require("./models/Recipe");
const Item = require("./models/Item");
const winston = require("winston");

/* eslint-disable */
(async function() {
  await require("./sequelize").sync({ force: true });

  winston.info("Creating item...");
  let item = await Item.create({
    id: 6994,
    name: "Cape Hôte",
    iconId: 17080,
    level: 56,
    description:
      "Cette création hybride entre une hôte et une cape, est franchement étonnante. Si elle avait été confectionnée en cuir, le Captain Chafer l'aurait adorée.",
  });

  winston.info("Creating recipe...");
  let recipe = await Recipe.create({
    resultId: 6994,
    resultName: "Cape Hôte",
    resultTypeId: 17,
    resultLevel: 56,
    ingredientIds: [1689, 642, 1730, 103, 1672, 291],
    quantities: [10, 1, 2, 1, 1, 8],
    jobId: 27,
    skillId: 63,
  });

  winston.info("Settings item's recipe...");
  item = await item.setRecipe(recipe);

  winston.info("Adding recipe's ingredient...");
  await recipe.addIngredient(item);

  winston.info("All recipes :");
  await Recipe.findAll({
    include: [{ model: Item, as: "ingredients" }, { model: Item, as: "result" }],
  }).then(recipes => {
    recipes.forEach(recipe => console.log(JSON.stringify(recipe.get({ plain: true }), null, 2)));
  });

  winston.info("All items :");
  await Item.findAll({
    include: [{ model: Recipe, as: "recipe" }],
  }).then(items => {
    items.forEach(item => console.log(item.get({ plain: true })));
  });
})();
