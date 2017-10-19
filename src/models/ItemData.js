"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");
const S_Item = require("./static/S_Item");
const ItemDescription = require("./ItemDescription");

const ItemData = sequelize.define(
  "itemData",
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    averagePrice: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    timestamp: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    serverId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    }
  },
  {
    timestamps: false,
  },
);

ItemData.belongsTo(S_Item, {
  as: "item",
  foreignKey: "itemId",
});

ItemData.hasMany(ItemDescription, {
  as: "itemDescriptions",
});

module.exports = ItemData;
