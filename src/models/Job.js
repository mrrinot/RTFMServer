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

Job.convert = function convertJob(job) {
  return {
    id: job.id,
    name: job.nameId_string,
    iconId: job.iconId,
  };
};

module.exports = Job;
