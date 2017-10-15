/* eslint-disable */

"use strict";

const winston = require("winston");
const nconf = require("nconf");
const path = require("path");
const bcrypt = require("bcrypt");

require("./src/tools/confSetup");
const User = require("./src/models/User");
const S_Job = require("./src/models/static/S_Job");
const S_Item = require("./src/models/static/S_Item");
const S_ItemType = require("./src/models/static/S_ItemType");
const S_Ingredient = require("./src/models/static/S_Ingredient");
const S_Recipe = require("./src/models/static/S_Recipe");
const S_Effect = require("./src/models/static/S_Effect");
const S_PossibleEffect = require("./src/models/static/S_PossibleEffect");
const sequelize = require("./src/sequelize");
const DataManager = require("./src/conversion/DataManager");

(async function() {
  await sequelize.sync({ force: true });

  const data = file => DataManager[file];

  let jobs = data("Jobs");

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
  let itemTypes = data("ItemTypes");
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

  //    _____   __   __              _
  //   | ____| / _| / _|  ___   ___ | |_  ___
  //   |  _|  | |_ | |_  / _ \ / __|| __|/ __|
  //   | |___ |  _||  _||  __/| (__ | |_ \__ \
  //   |_____||_|  |_|   \___| \___| \__||___/
  //
  let effects = data("Effects");
  try {
    winston.info(`Parsing effects... ${effects.length} entries`);
    effects = effects.map(effect => S_Effect.convert(effect));
    await S_Effect.bulkCreate(effects, { validate: true });
    winston.info("Effects parsed...");
  } catch (e) {
    winston.error("Unable to parse effects.");
    console.log(e);
    process.exit(1);
  }

  //    ___ _
  //   |_ _| |_ ___ _ __ ___  ___
  //    | || __/ _ \ '_ ` _ \/ __|
  //    | || ||  __/ | | | | \__ \
  //   |___|\__\___|_| |_| |_|___/
  //
  const originalItems = data("Items");
  let items = originalItems;
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

  //    ____                   _  _      _        _____   __   __              _
  //   |  _ \  ___   ___  ___ (_)| |__  | |  ___ | ____| / _| / _|  ___   ___ | |_  ___
  //   | |_) |/ _ \ / __|/ __|| || '_ \ | | / _ \|  _|  | |_ | |_  / _ \ / __|| __|/ __|
  //   |  __/| (_) |\__ \\__ \| || |_) || ||  __/| |___ |  _||  _||  __/| (__ | |_ \__ \
  //   |_|    \___/ |___/|___/|_||_.__/ |_| \___||_____||_|  |_|   \___| \___| \__||___/
  //
  items = originalItems;
  try {
    winston.info(`Creating possibleEffects for items...`);
    const possibleEffects = [];
    items.forEach((item, idx) => {
      item.possibleEffects.forEach(effect => {
        const convertedEffect = S_PossibleEffect.convert(effect);
        if (convertedEffect) {
          possibleEffects.push({ ...convertedEffect, sItemId: item.id });
        }
      });
    });
    winston.info(`${possibleEffects.length} possibleEffects found...`);
    await S_PossibleEffect.bulkCreate(possibleEffects, { validate: true });
    winston.info("PossibleEffects created...");
  } catch (e) {
    winston.error("Unable to create possibleEffects.");
    console.log(e);
    process.exit(1);
  }

  //    ____           _
  //   |  _ \ ___  ___(_)_ __   ___  ___
  //   | |_) / _ \/ __| | '_ \ / _ \/ __|
  //   |  _ <  __/ (__| | |_) |  __/\__ \
  //   |_| \_\___|\___|_| .__/ \___||___/
  //                    |_|
  const originalRecipes = data("Recipes");
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
    console.log(e);
    process.exit(1);
  }

  const recipeBois = await S_Item.findOne({
    where: { id: 694 },
    include: [{ model: S_PossibleEffect, as: "possibleEffects" }],
  });

  console.log(JSON.stringify(recipeBois.get({ plain: true }), null, 4));
})();
