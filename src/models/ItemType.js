"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

const ItemType = sequelize.define(
  "itemType",
  {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      index: true,
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: false,
  },
);

module.exports = ItemType;
