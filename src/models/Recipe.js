"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");
const Item = require("./Item");
const Job = require("./Job");

const Recipe = sequelize.define(
  "recipe",
  {
    quantities: {
      type: Sequelize.STRING,
      allowNull: false,
      get() {
        return this.getDataValue("quantities")
          .split(";")
          .map(val => parseInt(val, 10));
      },
      set(val) {
        this.setDataValue("quantities", val.join(";"));
      },
    },
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

Recipe.removeAttribute("id");

// Ingredients table with itemId, recipeId
Recipe.belongsToMany(Item, {
  as: "ingredients",
  constraints: false,
  timestamps: false,
  through: "Ingredients",
});
Item.belongsToMany(Recipe, {
  as: "foundIn",
  constraints: false,
  timestamps: false,
  through: "Ingredients",
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
