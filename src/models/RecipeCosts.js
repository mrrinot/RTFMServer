"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

module.exports = function RecipeCosts(date) {
  const recipe = sequelize.define(
    `recipeCost_${date}`,
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
      averagePrice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      lowestActualPrice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      totalIngredientsAveragePrice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      totalIngredientsActualPrice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      containsAverageUnknown: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      containsActualUnknown: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
    },
    { timestamps: false },
  );
  return recipe;
};
