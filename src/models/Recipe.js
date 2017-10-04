"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");
const Item = require("./Item");
const Job = require("./Job");
const Ingredient = require("./Ingredient");

const Recipe = sequelize.define(
  "recipe",
  {
    resultId: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      onDelete: "cascade",
    },
  },
  {
    timestamps: false,
  },
);

Recipe.make = async function makeRecipe(recipe) {
  const madeRecipe = await Recipe.create({
    resultId: recipe.resultId,
    quantities: [10, 1, 2, 1, 1, 8],
    jobId: 27,
  });
  const ingredients = recipe.ingredientIds.map((id, index) =>
    Ingredient.build({
      itemId: id,
      quantity: recipe.quantities[index],
    }),
  );
  try {
    await Promise.all(
      ingredients.map(async ing =>
        madeRecipe.addIngredient(ing.itemId, {
          through: { quantity: ing.quantity },
        }),
      ),
    );
  } catch (e) {
    console.log(e);
  }
  return Recipe.findOne({ where: { resultId: recipe.resultId } });
};

Recipe.removeAttribute("id");

// Ingredients table with itemId, recipeId
Recipe.belongsToMany(Item, {
  as: "ingredients",
  constraints: false,
  timestamps: false,
  through: Ingredient,
});
Item.belongsToMany(Recipe, {
  as: "foundIn",
  constraints: false,
  timestamps: false,
  through: Ingredient,
});

// Recipe.jobId
Recipe.belongsTo(Job, {
  as: "job",
});

// Recipe.resultId
Recipe.belongsTo(Item, {
  as: "result",
  foreignKey: "resultId",
});

module.exports = Recipe;
