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
      validate: {
        min: 1,
        max: 200,
      },
    },
    name: {
      index: true,
      type: Sequelize.STRING,
    },
    criticalHitProbability: {
      type: Sequelize.INTEGER,
      validate: {
        min: 0,
        max: 100,
      },
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

module.exports = Item;
