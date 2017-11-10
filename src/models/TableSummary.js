"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

const TableSummary = sequelize.define(
  "tableSummary",
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

module.exports = TableSummary;
