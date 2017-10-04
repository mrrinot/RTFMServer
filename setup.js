/* eslint-disable */

"use strict";

const winston = require("winston");
const nconf = require("nconf");
const path = require("path");

require("./src/tools/confSetup");
const Job = require("./src/models/Job");
const Item = require("./src/models/Item");
const ItemType = require("./src/models/ItemType");
const Ingredient = require("./src/models/Ingredient");
const Recipe = require("./src/models/Recipe");
const sequelize = require("./src/sequelize");

(async function() {
  await sequelize.sync({ force: true });
  const dataPath = path.resolve(process.cwd(), nconf.get("dataPath"));
  winston.info(`Loading from ${dataPath}`);

  const makePath = file => path.join(dataPath, `/${file}.json`);

  let jobs = require(`${makePath("Jobs")}`);

  //        _       _
  //       | | ___ | |__  ___
  //    _  | |/ _ \| '_ \/ __|
  //   | |_| | (_) | |_) \__ \
  //    \___/ \___/|_.__/|___/
  //
  try {
    winston.info(`Parsing jobs... ${jobs.length} entries`);
    jobs = jobs.map(job => Job.convert(job));
    await Job.bulkCreate(jobs, { validate: true });
    winston.info("Jobs parsed...");
  } catch (e) {
    winston.error("Unable to parse jobs.");
    console.log(e);
    process.exit(1);
  }

  //    ___ _               _____
  //   |_ _| |_ ___ _ __ __|_   _|   _ _ __   ___  ___
  //    | || __/ _ \ '_ ` _ \| || | | | '_ \ / _ \/ __|
  //    | || ||  __/ | | | | | || |_| | |_) |  __/\__ \
  //   |___|\__\___|_| |_| |_|_| \__, | .__/ \___||___/
  //                             |___/|_|
  let itemTypes = require(`${makePath("ItemTypes")}`);
  try {
    winston.info(`Parsing itemTypes... ${itemTypes.length} entries`);
    itemTypes = itemTypes.map(itemType => ItemType.convert(itemType));
    await ItemType.bulkCreate(itemTypes, { validate: true });
    winston.info("ItemTypes parsed...");
  } catch (e) {
    winston.error("Unable to parse itemTypes.");
    console.log(e);
    process.exit(1);
  }

  //    ___ _
  //   |_ _| |_ ___ _ __ ___  ___
  //    | || __/ _ \ '_ ` _ \/ __|
  //    | || ||  __/ | | | | \__ \
  //   |___|\__\___|_| |_| |_|___/
  //
  let items = require(`${makePath("Items")}`);
  try {
    winston.info(`Parsing items... ${items.length} entries`);
    items = items.map(item => Item.convert(item));
    await Item.bulkCreate(items, { validate: true });
    winston.info("Items parsed...");
  } catch (e) {
    winston.error("Unable to parse items.");
    console.log(e);
    process.exit(1);
  }

  //    ____           _
  //   |  _ \ ___  ___(_)_ __   ___  ___
  //   | |_) / _ \/ __| | '_ \ / _ \/ __|
  //   |  _ <  __/ (__| | |_) |  __/\__ \
  //   |_| \_\___|\___|_| .__/ \___||___/
  //                    |_|
  const originalRecipes = require(`${makePath("Recipes")}`);
  let recipes = originalRecipes;
  try {
    winston.info(`Parsing recipes... ${recipes.length} entries`);
    recipes = recipes.map(recipe => Recipe.convert(recipe));
    await Recipe.bulkCreate(recipes, { validate: true });
    winston.info("Recipes parsed...");
  } catch (e) {
    winston.error("Unable to parse recipes.");
    console.log(e);
    process.exit(1);
  }

  //    ___                          _ _            _
  //   |_ _|_ __   __ _ _ __ ___  __| (_) ___ _ __ | |_ ___
  //    | || '_ \ / _` | '__/ _ \/ _` | |/ _ \ '_ \| __/ __|
  //    | || | | | (_| | | |  __/ (_| | |  __/ | | | |_\__ \
  //   |___|_| |_|\__, |_|  \___|\__,_|_|\___|_| |_|\__|___/
  //              |___/
  recipes = originalRecipes;
  try {
    winston.info(`Creating ingredients for recipes...`);
    const ingredients = [];
    recipes.forEach(recipe => {
      recipe.ingredientIds.forEach((id, index) => {
        ingredients.push({
          itemId: id,
          recipeResultId: recipe.resultId,
          quantity: recipe.quantities[index],
        });
      });
    });
    winston.info(`${ingredients.length} ingredients found...`);
    await Ingredient.bulkCreate(ingredients, { validate: true });
    winston.info("Ingredients created...");
  } catch (e) {
    winston.error("Unable to create ingredients.");
    console.log(e);
    process.exit(1);
  }

  const recipeBois = await Recipe.findOne({
    where: { resultId: 44 },
    include: [
      { model: Item, as: "ingredients" },
      { model: Item, as: "result" },
      { model: Job, as: "job" },
    ],
  });

  console.log(JSON.stringify(recipeBois.get({ plain: true }), null, 4));
})();
