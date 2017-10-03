"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");
const Item = require("./Item");

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
  },
  {
    timestamps: false,
  },
);

Recipe.belongsToMany(Item, {
  as: "ingredients",
  constraints: false,
  through: "Ingredients",
});

Recipe.belongsTo(Item, { as: "result" });
Item.belongsTo(Recipe, {
  as: "recipe",
  allowNull: true,
  constraints: false,
  defaultValue: null,
});

module.exports = Recipe;
