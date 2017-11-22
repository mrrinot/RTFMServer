"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

const RecipeCostsTableIndex = sequelize.define(
  "recipeCostTableIndex",
  {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true,
    },
    date: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  { timestamps: false },
);

module.exports = RecipeCostsTableIndex;
