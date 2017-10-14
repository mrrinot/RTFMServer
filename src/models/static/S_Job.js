"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../../sequelize");

const S_Job = sequelize.define(
  "s_job",
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

S_Job.convert = function convertJob(job) {
  return {
    id: job.id,
    name: job.nameId_string,
    iconId: job.iconId,
  };
};

module.exports = S_Job;
