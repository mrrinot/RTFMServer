"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");
const S_Item = require("./static/S_Item");
const S_Server = require("./static/S_Server");

module.exports = function RecipeCosts(date) {
  const recipe = sequelize.define(
    `recipeCost_${date}`,
    {
      id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
      },
      timestamp: {
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
      averageCostDifference: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      actualCostDifference: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      averageCostDifferencePercentage: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      actualCostDifferencePercentage: {
        type: Sequelize.DECIMAL,
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
    {
      timestamps: false,
      tableName: `recipeCost_${date}`,
    },
  );

  recipe.belongsTo(S_Item, {
    as: "item",
    foreignKey: "itemId",
  });

  recipe.belongsTo(S_Server, {
    as: "server",
    foreignKey: "serverId",
  });
  return recipe;
};
