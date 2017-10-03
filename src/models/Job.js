"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

const Job = sequelize.define(
  "job",
  {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    iconId: {
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

module.exports = Job;
