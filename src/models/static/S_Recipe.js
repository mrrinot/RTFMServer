"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../../sequelize");
const S_Item = require("./S_Item");
const S_Job = require("./S_Job");
const S_Ingredient = require("./S_Ingredient");

const S_Recipe = sequelize.define(
  "s_recipe",
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

S_Recipe.convert = function convertS_Recipe(recipe) {
  return {
    resultId: recipe.resultId,
    jobId: recipe.jobId,
  };
};

S_Recipe.removeAttribute("id");

// S_Ingredients table with itemId, recipeId
S_Recipe.belongsToMany(S_Item, {
  as: "ingredients",
  foreignKey: "recipeResultId",
  otherKey: "itemId",
  constraints: false,
  timestamps: false,
  through: S_Ingredient,
});

// S_Recipe.jobId
S_Recipe.belongsTo(S_Job, {
  as: "job",
  foreignKey: "jobId",
  constraints: false,
});

// S_Recipe.resultId
S_Recipe.belongsTo(S_Item, {
  as: "result",
  foreignKey: "resultId",
  constraints: false,
});

module.exports = S_Recipe;
