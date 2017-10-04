"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");
const Item = require("./Item");
const Job = require("./Job");
const winston = require("winston");
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

Recipe.convert = function convertRecipe(recipe) {
  return {
    resultId: recipe.resultId,
    jobId: recipe.jobId,
  };
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
