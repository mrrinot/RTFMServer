"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");
const S_Item = require("./static/S_Item");
const S_Server = require("./static/S_Server");

module.exports = function ItemData(date, descInstance) {
  const data = sequelize.define(
    `itemData_${date}`,
    {
      id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
      },
      averagePrice: {
        type: Sequelize.INTEGER,
        allowNull: true,
        index: true,
      },
      timestamp: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: `itemData_${date}`,
    },
  );

  data.belongsTo(S_Item, {
    as: "item",
    foreignKey: "itemId",
  });

  data.belongsTo(S_Server, {
    as: "server",
    foreignKey: "serverId",
  });

  data.hasMany(descInstance, {
    as: "itemDescriptions",
    foreignKey: "itemDatumId",
  });
  return data;
};
