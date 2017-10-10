"use strict";

const Sequelize = require("sequelize");
const nconf = require("nconf");
const path = require("path");
const winston = require("winston");

module.exports = new Sequelize(
  nconf.get("DB_NAME"),
  nconf.get("DB_USERNAME"),
  nconf.get("DB_PASSWORD"),
  {
    host: nconf.get("DB_HOST"),
    dialect: nconf.get("DB_DIALECT"),
    operatorsAliases: false,

    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },

    logging(...args) {
      winston.verbose(...args);
    },

    storage: path.join(nconf.get("base_dir"), "db.sqlite"),
  },
);
