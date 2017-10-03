"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

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
      type: Sequelize.STRING(1024),
    },
    description: {
      type: Sequelize.TEXT("medium"),
    },
  },
  {
    timestamps: false,
  },
);

module.exports = Item;
