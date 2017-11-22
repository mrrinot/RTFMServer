"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

const ItemDataTableIndex = sequelize.define(
  "itemDataTableIndex",
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

module.exports = ItemDataTableIndex;
