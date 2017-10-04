"use strict";

require("./models/User");
const Recipe = require("./models/Recipe");
const Item = require("./models/Item");
const Job = require("./models/Job");
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

  winston.info("Creating item...");
  await Item.create({
    id: 6995,
    name: "Cape Hôte2",
    iconId: 17080,
    level: 56,
    description:
      "Cette création hybride entre une hôte et une cape, est franchement étonnante. Si elle avait été confectionnée en cuir, le Captain Chafer l'aurait adorée.",
  });

  winston.info("Creating job...");
  let job = await Job.create({
    id: 27,
    name: "Tailleur",
    iconId: 20,
  });

  winston.info("Creating recipe...");
  let recipe = await Recipe.make({
    resultId: 6994,
    resultName: "Cape Hôte",
    resultTypeId: 17,
    resultLevel: 56,
    ingredientIds: [6994, 6995],
    quantities: [10, 1],
    skillId: 63,
    jobId: 27,
  });

  winston.info("Settings recipe's result...");
  recipe = await recipe.setResult(item);

  winston.info("Adding recipe's ingredient...");
  await recipe.addIngredient(item);

  winston.info("All recipes :");
  await Recipe.findAll({
    include: [
      { model: Item, as: "ingredients" },
      { model: Item, as: "result" },
      { model: Job, as: "job" },
    ],
  }).then(recipes => {
    recipes.forEach(recipe => console.log(JSON.stringify(recipe.get({ plain: true }), null, 2)));
  });

  winston.info("All items :");
  await Item.findAll({
    include: [{ model: Recipe, as: "foundIn" }],
  }).then(items => {
    items.forEach(item => console.log(JSON.stringify(item.get({ plain: true }), null, 2)));
  });
})();
