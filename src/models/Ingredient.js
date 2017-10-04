"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

const Ingredient = sequelize.define(
  "ingredient",
  {
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  },
);

module.exports = Ingredient;
