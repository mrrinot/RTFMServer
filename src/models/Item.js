"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");
const ItemType = require("./ItemType");

const Item = sequelize.define(
  "item",
  {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    iconId: {
      type: Sequelize.INTEGER,
    },
    level: {
      type: Sequelize.INTEGER,
    },
    name: {
      index: true,
      type: Sequelize.STRING,
    },
    criticalHitProbability: {
      type: Sequelize.INTEGER,
    },
    criteria: {
      type: Sequelize.STRING,
    },
    ethereal: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    description: {
      type: Sequelize.TEXT,
    },
  },
  {
    timestamps: false,
  },
);

Item.belongsTo(ItemType, {
  as: "type",
});

Item.convert = function convertItem(item) {
  return {
    id: item.id,
    iconId: item.iconId,
    level: item.level,
    name: item.nameId_string,
    criticalHitProbability: item.criticalHitProbability,
    criteria: item.criteria,
    ethereal: item.ethereal,
    description: item.descriptionId_string,
    typeId: item.typeId,
  };
};

module.exports = Item;
