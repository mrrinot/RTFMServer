/* eslint-disable */

"use strict";

const winston = require("winston");
const nconf = require("nconf");
const path = require("path");

require("./src/tools/confSetup");
const S_Job = require("./src/models/S_Job");
const S_Item = require("./src/models/S_Item");
const User = require("./src/models/User");
const S_ItemType = require("./src/models/S_ItemType");
const S_Ingredient = require("./src/models/S_Ingredient");
const S_Recipe = require("./src/models/S_Recipe");
const sequelize = require("./src/sequelize");
const bcrypt = require("bcrypt");

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
    jobs = jobs.map(job => S_Job.convert(job));
    await S_Job.bulkCreate(jobs, { validate: true });
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
    itemTypes = itemTypes.map(itemType => S_ItemType.convert(itemType));
    await S_ItemType.bulkCreate(itemTypes, { validate: true });
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
    items = items.map(item => S_Item.convert(item));
    await S_Item.bulkCreate(items, { validate: true });
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
    recipes = recipes.map(recipe => S_Recipe.convert(recipe));
    await S_Recipe.bulkCreate(recipes, { validate: true });
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
    await S_Ingredient.bulkCreate(ingredients, { validate: true });
    winston.info("Ingredients created...");
  } catch (e) {
    winston.error("Unable to create ingredients.");
    console.log(e);
    process.exit(1);
  }

  try {
    winston.info("Creating dummy user");
    const user = {
      email: "test@test.com",
      pseudo: "SuperCoolGuy",
      adminLevel: 3,
      password: bcrypt.hashSync("pass", nconf.get("bcrypt_rounds")),
    };
    await User.create(user);
  } catch (e) {
    winston.error("Unable to add dummy user");
    winston.error(e);
    process.exit(1);
  }

  const recipeBois = await S_Recipe.findOne({
    where: { resultId: 44 },
    include: [
      { model: S_Item, as: "ingredients" },
      { model: S_Item, as: "result" },
      { model: S_Job, as: "job" },
    ],
  });

  console.log(JSON.stringify(recipeBois.get({ plain: true }), null, 4));
})();
