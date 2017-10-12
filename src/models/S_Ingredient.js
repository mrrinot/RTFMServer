"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

const S_Ingredient = sequelize.define(
  "s_ingredient",
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

module.exports = S_Ingredient;
